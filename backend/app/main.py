import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field

from . import solver_adapter
from . import openfoam_adapter
from . import geometry_kernel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fea-solver-backend")

app = FastAPI(title="4M Engineering Cloud - Real Solver Backend")


class BeamSolveRequest(BaseModel):
    length: float = 1.0
    width: float = 0.05
    height: float = 0.1
    forceY: float = -10000.0
    youngsModulus: float = 210e9
    yieldStrength: float = 355e6
    poissonRatio: float = Field(default=0.3, ge=0.0, lt=0.5)


class PipeFlowSolveRequest(BaseModel):
    diameter: float = 0.1
    length: float = 5.0
    inletVelocity: float = 3.0
    density: float = 998.2
    dynamicViscosity: float = 1.002e-3
    roughness: float = 0.000045


@app.get("/health")
def health():
    status = {"status": "ok"}
    http_status = 200
    try:
        status["ccxAvailable"] = True
        status["ccxVersion"] = solver_adapter._get_ccx_version()
    except solver_adapter.SolverNotAvailableError as exc:
        status["ccxAvailable"] = False
        status["ccxMessage"] = str(exc)
        status["status"] = "degraded"
        http_status = 503

    try:
        openfoam_adapter._require_binaries()
        status["openfoamAvailable"] = True
    except openfoam_adapter.SolverNotAvailableError as exc:
        status["openfoamAvailable"] = False
        status["openfoamMessage"] = str(exc)
        status["status"] = "degraded"
        http_status = 503

    return JSONResponse(status_code=http_status, content=status)


@app.post("/solve/fea/beam")
def solve_fea_beam(req: BeamSolveRequest):
    input_config = req.model_dump()
    provenance_hash = hashlib.sha256(
        json.dumps(input_config, sort_keys=True).encode("utf-8")
    ).hexdigest()

    try:
        result = solver_adapter.solve_cantilever_beam(
            length=req.length,
            width=req.width,
            height=req.height,
            force_y=req.forceY,
            youngs_modulus=req.youngsModulus,
            poisson_ratio=req.poissonRatio,
        )
    except solver_adapter.SolverNotAvailableError as exc:
        logger.error("ccx binary not available: %s", exc)
        raise HTTPException(status_code=503, detail={
            "error": "SOLVER_NOT_AVAILABLE",
            "message": str(exc),
        })
    except solver_adapter.SolverFailedError as exc:
        logger.error("ccx run failed: %s", exc)
        raise HTTPException(status_code=502, detail={
            "error": "SOLVER_RUN_FAILED",
            "message": str(exc),
        })

    safety_factor = req.yieldStrength / (result.max_von_mises_stress_mpa * 1e6)

    return {
        "solver": f"CalculiX ({result.ccx_version})",
        "resultType": "fem_solver",
        "modelType": "Linear Elastic 3D Cantilever Beam (Real FEM Solve)",
        "mesh": {
            "elementType": result.mesh.element_type,
            "elementCount": result.mesh.element_count,
            "nodeCount": result.mesh.node_count,
            "divisions": {"nx": result.mesh.nx, "ny": result.mesh.ny, "nz": result.mesh.nz},
        },
        "material": {
            "name": "User-Defined Isotropic Material",
            "youngsModulusGpa": req.youngsModulus / 1e9,
            "yieldStrengthMpa": req.yieldStrength / 1e6,
            "poissonRatio": req.poissonRatio,
        },
        "dimensions": {
            "lengthM": req.length,
            "widthMm": req.width * 1000,
            "heightMm": req.height * 1000,
        },
        "loads": {"tipForceY": req.forceY},
        "reactions": {
            "reactionForceY": round(result.reaction_force_y, 3),
            "reactionMomentZ": round(abs(req.forceY) * req.length, 3),
            "equilibriumCheck": result.equilibrium_check,
        },
        "results": {
            "maxVonMisesStressMpa": round(result.max_von_mises_stress_mpa, 3),
            "tipDisplacementMm": round(result.tip_displacement_mm, 4),
            "safetyFactor": round(safety_factor, 3),
            "status": "STRUCTURALLY_SAFE" if safety_factor >= 1.5 else "YIELD_EXCEEDED_WARNING",
        },
        "distribution": result.distribution,
        "solveTimeSeconds": round(result.solve_time_seconds, 4),
        "provenanceHash": provenance_hash,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sourceFiles": {"inp": result.inp_path, "frd": result.frd_path},
    }


@app.post("/solve/cfd/pipe-flow")
def solve_cfd_pipe_flow(req: PipeFlowSolveRequest):
    input_config = req.model_dump()
    provenance_hash = hashlib.sha256(
        json.dumps(input_config, sort_keys=True).encode("utf-8")
    ).hexdigest()

    try:
        result = openfoam_adapter.solve_pipe_flow(
            diameter=req.diameter,
            length=req.length,
            inlet_velocity=req.inletVelocity,
            density=req.density,
            dynamic_viscosity=req.dynamicViscosity,
            roughness=req.roughness,
        )
    except openfoam_adapter.SolverNotAvailableError as exc:
        logger.error("OpenFOAM binaries not available: %s", exc)
        raise HTTPException(status_code=503, detail={
            "error": "SOLVER_NOT_AVAILABLE",
            "message": str(exc),
        })
    except openfoam_adapter.SolverFailedError as exc:
        logger.error("OpenFOAM run failed: %s", exc)
        raise HTTPException(status_code=502, detail={
            "error": "SOLVER_RUN_FAILED",
            "message": str(exc),
        })

    reynolds = (req.density * req.inletVelocity * req.diameter) / req.dynamicViscosity

    return {
        "solver": "OpenFOAM simpleFoam (Real RANS k-epsilon CFD Solve)",
        "resultType": "cfd_solver",
        "modelType": "Steady RANS, Axisymmetric Wedge Pipe Flow",
        "mesh": {
            "cellCount": result.n_cells,
            "representation": "5-degree axisymmetric wedge (standard OpenFOAM pipe-flow technique)",
        },
        "fluid": {
            "densityKgM3": req.density,
            "dynamicViscosityPaS": req.dynamicViscosity,
            "reynoldsNumber": round(reynolds, 1),
            "flowRegime": "turbulent" if reynolds > 4000 else "laminar",
        },
        "geometry": {"diameterMm": req.diameter * 1000, "lengthM": req.length},
        "boundaryConditions": {
            "inletVelocityMs": req.inletVelocity,
            "outletPressurePa": 0,
            "wallRoughnessMm": req.roughness * 1000,
        },
        "results": {
            "pressureDropPa": round(result.pressure_drop_pa, 2),
            "pressureDropBar": round(result.pressure_drop_pa / 1e5, 5),
            "wallShearStressPa": round(result.wall_shear_stress_pa, 3),
        },
        "convergence": {
            "converged": result.converged,
            "residualTarget": 1e-4,
        },
        "solveTimeSeconds": round(result.solve_time_seconds, 4),
        "provenanceHash": provenance_hash,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sourceCaseDir": result.case_dir,
    }


@app.websocket("/ws/solve/cfd/pipe-flow")
async def ws_solve_cfd_pipe_flow(websocket: WebSocket):
    """
    Real-time monitoring (Priority 4): every event sent over this socket is
    parsed live from the actual simpleFoam subprocess's stdout as it runs -
    there is no setInterval/fake progress counter anywhere in this path.
    Disconnecting the client cancels the underlying solve.
    """
    await websocket.accept()
    try:
        params = await websocket.receive_json()
    except Exception:
        params = {}

    req = PipeFlowSolveRequest(**params)

    try:
        async for event in openfoam_adapter.solve_pipe_flow_streaming(
            diameter=req.diameter,
            length=req.length,
            inlet_velocity=req.inletVelocity,
            density=req.density,
            dynamic_viscosity=req.dynamicViscosity,
            roughness=req.roughness,
        ):
            await websocket.send_json(event)
    except WebSocketDisconnect:
        logger.info("Client disconnected from CFD monitoring socket; cancelling solve")
        return
    except openfoam_adapter.SolverNotAvailableError as exc:
        await websocket.send_json({"event": "simulation.failed", "stage": "startup", "message": str(exc)})
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


GEOMETRY_STORAGE_DIR = os.environ.get("GEOMETRY_STORAGE_DIR", "/tmp/cae_geometry")
os.makedirs(GEOMETRY_STORAGE_DIR, exist_ok=True)


@app.post("/geometry/import")
async def import_geometry(file: UploadFile = File(...)):
    """
    Real geometry import (Priority 6): saves the uploaded file, parses it
    with the actual OpenCASCADE kernel (geometry_kernel.py, via the
    cadquery-ocp/OCP bindings), and returns REAL extracted topology - face/
    edge/vertex counts and volume come from OCCT's own explorer and
    mass-property algorithms, never estimated. Also writes a real
    tessellated STL preview the 3D viewer can load directly.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in (".step", ".stp", ".stl"):
        raise HTTPException(status_code=400, detail={
            "error": "UNSUPPORTED_FORMAT",
            "message": f"'{ext}' is not supported. Supported formats: .step, .stp, .stl",
        })

    geometry_id = str(uuid.uuid4())
    saved_path = os.path.join(GEOMETRY_STORAGE_DIR, f"{geometry_id}{ext}")
    with open(saved_path, "wb") as f:
        f.write(await file.read())

    try:
        topology, stl_preview_path = geometry_kernel.import_geometry_file(saved_path)
    except geometry_kernel.GeometryImportError as exc:
        raise HTTPException(status_code=422, detail={
            "error": "GEOMETRY_IMPORT_FAILED",
            "message": str(exc),
        })

    return {
        "geometryId": geometry_id,
        "originalFilename": file.filename,
        "kernel": "OpenCASCADE (via cadquery-ocp/OCP bindings)",
        "topology": {
            "faceCount": topology.face_count,
            "edgeCount": topology.edge_count,
            "vertexCount": topology.vertex_count,
            "faces": topology.faces,
        },
        "volume": topology.volume,
        "boundingBox": topology.bounding_box,
        "previewUrl": f"/geometry/{geometry_id}/preview.stl",
    }


@app.get("/geometry/{geometry_id}/preview.stl")
def get_geometry_preview(geometry_id: str):
    for ext in (".step", ".stp", ".stl"):
        candidate = os.path.join(GEOMETRY_STORAGE_DIR, f"{geometry_id}{ext}.preview.stl")
        if os.path.exists(candidate):
            return FileResponse(candidate, media_type="model/stl")
    raise HTTPException(status_code=404, detail={"error": "NOT_FOUND", "message": "No preview found for this geometry ID"})
