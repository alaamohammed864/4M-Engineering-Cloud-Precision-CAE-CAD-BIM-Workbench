import hashlib
import json
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import solver_adapter

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


@app.get("/health")
def health():
    try:
        version = solver_adapter._get_ccx_version()
        return {"status": "ok", "ccxAvailable": True, "ccxVersion": version}
    except solver_adapter.SolverNotAvailableError as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "ccxAvailable": False, "message": str(exc)},
        )


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
