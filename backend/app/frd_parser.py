"""
Parser for CalculiX .frd ASCII result files.

The .frd "short" record format is fixed-column, not whitespace-delimited:
negative values are written with no leading space before the sign, so a
naive str.split() silently misaligns columns. Each data record is:

    ' -1' + <node id, 10 cols> + <value, 12 cols> * N

This parser slices by fixed column width rather than splitting on
whitespace, and is verified against a known CalculiX run where naive
whitespace-splitting produced wrong values for negative-signed fields.
"""
from dataclasses import dataclass
from typing import List


@dataclass
class NodeVector:
    node_id: int
    values: List[float]


def _parse_block(lines: List[str], n_values: int) -> List[NodeVector]:
    out = []
    for line in lines:
        if not line.startswith(" -1"):
            continue
        node_id = int(line[3:13])
        values = []
        for i in range(n_values):
            start = 13 + 12 * i
            end = start + 12
            chunk = line[start:end]
            values.append(float(chunk))
        out.append(NodeVector(node_id=node_id, values=values))
    return out


def parse_frd(path: str):
    """Returns (displacements, stresses, reaction_forces) as lists of NodeVector.

    displacements:    values = [D1, D2, D3] (meters)
    stresses:         values = [SXX, SYY, SZZ, SXY, SYZ, SZX] (Pa)
    reaction_forces:  values = [F1, F2, F3] (Newtons; nonzero only at constrained nodes)
    """
    with open(path, "r") as f:
        lines = f.readlines()

    disp_lines: List[str] = []
    stress_lines: List[str] = []
    forc_lines: List[str] = []
    mode = None
    for line in lines:
        stripped = line.rstrip("\n")
        if " DISP " in stripped and stripped.strip().startswith("-4"):
            mode = "disp"
            continue
        if " STRESS " in stripped and stripped.strip().startswith("-4"):
            mode = "stress"
            continue
        if " FORC " in stripped and stripped.strip().startswith("-4"):
            mode = "forc"
            continue
        if stripped.strip() == "-3":
            mode = None
            continue
        if mode == "disp" and stripped.startswith(" -1"):
            disp_lines.append(stripped)
        elif mode == "stress" and stripped.startswith(" -1"):
            stress_lines.append(stripped)
        elif mode == "forc" and stripped.startswith(" -1"):
            forc_lines.append(stripped)

    if not disp_lines:
        raise RuntimeError(
            "No DISP block found in .frd output - solver did not produce "
            "displacement results (check .sta/.cvg for a failed/incomplete run)"
        )
    if not stress_lines:
        raise RuntimeError(
            "No STRESS block found in .frd output - solver did not produce "
            "stress results (check .sta/.cvg for a failed/incomplete run)"
        )
    if not forc_lines:
        raise RuntimeError(
            "No FORC (reaction force) block found in .frd output - cannot "
            "verify static equilibrium against real solver output"
        )

    displacements = _parse_block(disp_lines, 3)
    stresses = _parse_block(stress_lines, 6)
    reaction_forces = _parse_block(forc_lines, 3)
    return displacements, stresses, reaction_forces


def von_mises(sxx: float, syy: float, szz: float, sxy: float, syz: float, szx: float) -> float:
    return (
        0.5
        * (
            (sxx - syy) ** 2
            + (syy - szz) ** 2
            + (szz - sxx) ** 2
            + 6 * (sxy ** 2 + syz ** 2 + szx ** 2)
        )
    ) ** 0.5
