import os
import shutil
import subprocess
import tempfile
import time
from dataclasses import dataclass
from typing import Optional

from . import frd_parser, mesh_generator

CCX_TIMEOUT_SECONDS = 60
CCX_BINARY = "ccx"


class SolverNotAvailableError(Exception):
    """Raised when the real ccx binary cannot be found. Callers must
    surface this as a loud error - never silently fall back to a
    closed-form formula."""


class SolverFailedError(Exception):
    pass


@dataclass
class BeamSolveResult:
    tip_displacement_mm: float
    max_von_mises_stress_mpa: float
    mesh: mesh_generator.MeshInfo
    solve_time_seconds: float
    inp_path: str
    frd_path: str
    dat_path: str
    ccx_version: str
    reaction_force_y: float
    applied_force_y: float
    equilibrium_check: str
    distribution: list  # [{station, xRatio, xMeters, displacementMm, vonMisesStressMpa}, ...]


def _get_ccx_version() -> str:
    binary = shutil.which(CCX_BINARY)
    if binary is None:
        raise SolverNotAvailableError(
            f"CalculiX binary '{CCX_BINARY}' is not installed in this container. "
            "Install the 'calculix-ccx' package. Refusing to fall back to a "
            "closed-form formula for a request that asked for a real FEM solve."
        )
    proc = subprocess.run([binary, "-v"], capture_output=True, text=True, timeout=10)
    out = (proc.stdout or "") + (proc.stderr or "")
    for line in out.splitlines():
        if "Version" in line:
            return line.strip()
    return "unknown"


def solve_cantilever_beam(
    length: float,
    width: float,
    height: float,
    force_y: float,
    youngs_modulus: float,
    poisson_ratio: float,
    nx: int = 16,
    ny: int = 4,
    nz: int = 4,
    keep_workdir: Optional[str] = None,
) -> BeamSolveResult:
    ccx_version = _get_ccx_version()  # raises SolverNotAvailableError if missing

    workdir = keep_workdir or tempfile.mkdtemp(prefix="ccx_run_")
    job_name = "beam"
    inp_path = os.path.join(workdir, f"{job_name}.inp")

    mesh_info = mesh_generator.generate_beam_inp(
        length=length,
        width=width,
        height=height,
        force_y=force_y,
        youngs_modulus=youngs_modulus,
        poisson_ratio=poisson_ratio,
        out_path=inp_path,
        nx=nx,
        ny=ny,
        nz=nz,
    )

    binary = shutil.which(CCX_BINARY)
    start = time.monotonic()
    try:
        proc = subprocess.run(
            [binary, "-i", job_name],
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=CCX_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        raise SolverFailedError(
            f"ccx did not finish within {CCX_TIMEOUT_SECONDS}s and was killed"
        ) from exc
    elapsed = time.monotonic() - start

    frd_path = os.path.join(workdir, f"{job_name}.frd")
    dat_path = os.path.join(workdir, f"{job_name}.dat")
    sta_path = os.path.join(workdir, f"{job_name}.sta")

    if proc.returncode != 0 or not os.path.exists(frd_path):
        sta_content = ""
        if os.path.exists(sta_path):
            with open(sta_path) as f:
                sta_content = f.read()
        raise SolverFailedError(
            f"ccx exited with code {proc.returncode} or produced no .frd output.\n"
            f"stdout tail: {proc.stdout[-2000:]}\n"
            f"stderr tail: {proc.stderr[-2000:]}\n"
            f".sta: {sta_content}"
        )

    displacements, stresses, reaction_forces = frd_parser.parse_frd(frd_path)

    disp_by_node = {d.node_id: d.values for d in displacements}
    tip_values = disp_by_node.get(mesh_info.tip_centerline_node_id)
    if tip_values is None:
        raise SolverFailedError(
            f"Tip centerline node {mesh_info.tip_centerline_node_id} not found in "
            "parsed displacement results"
        )
    tip_displacement_m = tip_values[1]  # D2 = Y-direction displacement

    # Max von Mises across every element-nodal stress record (true peak, not averaged)
    max_vm = 0.0
    for s in stresses:
        sxx, syy, szz, sxy, syz, szx = s.values
        vm = frd_parser.von_mises(sxx, syy, szz, sxy, syz, szx)
        if vm > max_vm:
            max_vm = vm

    # Per-node averaged von Mises (a shared node has one stress record per
    # adjacent element; average them for a representative centerline value)
    vm_sums: dict = {}
    vm_counts: dict = {}
    for s in stresses:
        sxx, syy, szz, sxy, syz, szx = s.values
        vm = frd_parser.von_mises(sxx, syy, szz, sxy, syz, szx)
        vm_sums[s.node_id] = vm_sums.get(s.node_id, 0.0) + vm
        vm_counts[s.node_id] = vm_counts.get(s.node_id, 0) + 1
    vm_avg_by_node = {n: vm_sums[n] / vm_counts[n] for n in vm_sums}

    # Real reaction force: sum of solver-computed nodal reaction forces (RF)
    # over the fixed node set. Equal-and-opposite to the applied load if and
    # only if the FEM solution actually satisfies static equilibrium - this
    # is a genuine check against solver output, not an assumed identity.
    rf_by_node = {r.node_id: r.values for r in reaction_forces}
    reaction_force_y = sum(
        rf_by_node[n][1] for n in mesh_info.fixed_node_ids if n in rf_by_node
    )
    equilibrium_ok = abs(reaction_force_y - abs(force_y)) / max(abs(force_y), 1e-9) < 0.01
    equilibrium_check = (
        "PASSED (FEM reaction force matches applied load within 1%)"
        if equilibrium_ok
        else f"WARNING: FEM reaction {reaction_force_y:.2f} N vs applied {abs(force_y):.2f} N"
    )

    # Distribution along the beam axis, read directly from solved centerline
    # nodes - not re-evaluated from a closed-form formula.
    distribution = []
    n_stations = len(mesh_info.centerline_node_ids)
    for i, node_id in enumerate(mesh_info.centerline_node_ids):
        x_ratio = i / (n_stations - 1)
        d = disp_by_node.get(node_id)
        vm = vm_avg_by_node.get(node_id)
        distribution.append({
            "station": i,
            "xRatio": round(x_ratio, 3),
            "xMeters": round(x_ratio * length, 4),
            "displacementMm": round(abs(d[1]) * 1000.0, 4) if d else None,
            "vonMisesStressMpa": round(vm / 1e6, 3) if vm is not None else None,
        })

    return BeamSolveResult(
        tip_displacement_mm=abs(tip_displacement_m) * 1000.0,
        max_von_mises_stress_mpa=max_vm / 1e6,
        mesh=mesh_info,
        solve_time_seconds=elapsed,
        inp_path=inp_path,
        frd_path=frd_path,
        dat_path=dat_path,
        ccx_version=ccx_version,
        reaction_force_y=reaction_force_y,
        applied_force_y=force_y,
        equilibrium_check=equilibrium_check,
        distribution=distribution,
    )
