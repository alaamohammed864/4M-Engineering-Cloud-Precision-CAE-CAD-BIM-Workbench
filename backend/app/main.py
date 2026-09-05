import hashlib
import json
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import solver_adapter
from . import openfoam_adapter

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
