"""
Generates a real OpenFOAM case directory for steady, fully-developed
turbulent pipe flow, modeled as a thin axisymmetric wedge (the standard
OpenFOAM technique for pipe flow: a 5-degree wedge slice with 'wedge'
boundary patches on its two flat faces, one cell thick in the angular
direction, avoiding the cost of a full 3D pipe mesh).

This produces files that blockMesh and simpleFoam consume directly - there
is no analytical formula anywhere in this module. Every number derived
from the case (pressure drop, wall shear stress) must come from parsing
the solver's own output field files (see openfoam_adapter.py), never from
re-evaluating Darcy-Weisbach/Swamee-Jain here.
"""
import math
import os
from dataclasses import dataclass


@dataclass
class PipeMeshInfo:
    n_radial: int
    n_axial: int
    diameter: float
    length: float


def _write(path: str, content: str) -> None:
    with open(path, "w") as f:
        f.write(content)


def generate_pipe_case(
    out_dir: str,
    diameter: float,
    length: float,
    inlet_velocity: float,
    density: float,
    dynamic_viscosity: float,
    roughness: float,
    n_radial: int = 20,
    n_axial: int = 100,
    end_time: int = 300,
) -> PipeMeshInfo:
    """Write a complete OpenFOAM case (system/, constant/, 0/) to out_dir."""
    os.makedirs(os.path.join(out_dir, "system"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "constant"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "0"), exist_ok=True)

    R = diameter / 2.0
    L = length
    alpha = math.radians(2.5)  # half-angle of the wedge slice
    Rc = R * math.cos(alpha)
    Rs = R * math.sin(alpha)
    nu = dynamic_viscosity / density

    # Turbulence initial conditions from 5% intensity + pipe mixing length,
    # standard engineering estimate - not fitted to match any target answer.
    intensity = 0.05
    k0 = 1.5 * (intensity * inlet_velocity) ** 2
    mixing_length = 0.07 * diameter
    Cmu = 0.09
    epsilon0 = (Cmu ** 0.75) * (k0 ** 1.5) / mixing_length

    _write(os.path.join(out_dir, "system", "blockMeshDict"), f"""FoamFile
{{
    version 2.0;
    format ascii;
    class dictionary;
    object blockMeshDict;
}}

convertToMeters 1;

vertices
(
    (0.0 0.0 0.0)
    (0.0 {Rc} {-Rs})
    (0.0 {Rc} {Rs})
    ({L} 0.0 0.0)
    ({L} {Rc} {-Rs})
    ({L} {Rc} {Rs})
);

blocks
(
    hex (0 1 2 0 3 4 5 3) ({n_radial} 1 {n_axial}) simpleGrading (0.2 1 1)
);

edges
(
);

boundary
(
    inlet   {{ type patch; faces ((0 0 2 1)); }}
    outlet  {{ type patch; faces ((3 4 5 3)); }}
    wall    {{ type wall;  faces ((1 2 5 4)); }}
    wedgeFront {{ type wedge; faces ((0 1 4 3)); }}
    wedgeBack  {{ type wedge; faces ((0 3 5 2)); }}
);

mergePatchPairs
(
);
""")

    _write(os.path.join(out_dir, "system", "controlDict"), f"""FoamFile
{{ version 2.0; format ascii; class dictionary; object controlDict; }}
application     simpleFoam;
startFrom       startTime;
startTime       0;
stopAt          endTime;
endTime         {end_time};
deltaT          1;
writeControl    timeStep;
writeInterval   {end_time};
purgeWrite      2;
writeFormat     ascii;
writePrecision  6;
writeCompression off;
timeFormat      general;
timePrecision   6;
runTimeModifiable true;
""")

    _write(os.path.join(out_dir, "system", "fvSchemes"), """FoamFile
{ version 2.0; format ascii; class dictionary; object fvSchemes; }
ddtSchemes { default steadyState; }
gradSchemes { default Gauss linear; }
divSchemes
{
    default         none;
    div(phi,U)      bounded Gauss upwind;
    div(phi,k)      bounded Gauss upwind;
    div(phi,epsilon) bounded Gauss upwind;
    div((nuEff*dev2(T(grad(U))))) Gauss linear;
}
laplacianSchemes { default Gauss linear corrected; }
interpolationSchemes { default linear; }
snGradSchemes { default corrected; }
wallDist { method meshWave; }
""")

    _write(os.path.join(out_dir, "system", "fvSolution"), """FoamFile
{ version 2.0; format ascii; class dictionary; object fvSolution; }
solvers
{
    p { solver GAMG; tolerance 1e-06; relTol 0.1; smoother GaussSeidel; }
    "(U|k|epsilon)" { solver smoothSolver; smoother GaussSeidel; tolerance 1e-08; relTol 0.1; }
}
SIMPLE
{
    nNonOrthogonalCorrectors 0;
    consistent yes;
    residualControl { p 1e-5; U 1e-5; "(k|epsilon)" 1e-5; }
}
relaxationFactors
{
    equations { U 0.9; "(k|epsilon)" 0.9; }
}
""")

    _write(os.path.join(out_dir, "constant", "transportProperties"), f"""FoamFile
{{ version 2.0; format ascii; class dictionary; object transportProperties; }}
transportModel Newtonian;
nu              nu [0 2 -1 0 0 0 0] {nu};
""")

    _write(os.path.join(out_dir, "constant", "turbulenceProperties"), """FoamFile
{ version 2.0; format ascii; class dictionary; object turbulenceProperties; }
simulationType RAS;
RAS { RASModel kEpsilon; turbulence on; printCoeffs on; }
""")

    _write(os.path.join(out_dir, "0", "U"), f"""FoamFile
{{ version 2.0; format ascii; class volVectorField; object U; }}
dimensions [0 1 -1 0 0 0 0];
internalField uniform ({inlet_velocity} 0 0);
boundaryField
{{
    inlet {{ type fixedValue; value uniform ({inlet_velocity} 0 0); }}
    outlet {{ type zeroGradient; }}
    wall {{ type noSlip; }}
    wedgeFront {{ type wedge; }}
    wedgeBack {{ type wedge; }}
}}
""")

    _write(os.path.join(out_dir, "0", "p"), """FoamFile
{ version 2.0; format ascii; class volScalarField; object p; }
dimensions [0 2 -2 0 0 0 0];
internalField uniform 0;
boundaryField
{
    inlet { type zeroGradient; }
    outlet { type fixedValue; value uniform 0; }
    wall { type zeroGradient; }
    wedgeFront { type wedge; }
    wedgeBack { type wedge; }
}
""")

    _write(os.path.join(out_dir, "0", "k"), f"""FoamFile
{{ version 2.0; format ascii; class volScalarField; object k; }}
dimensions [0 2 -2 0 0 0 0];
internalField uniform {k0};
boundaryField
{{
    inlet {{ type fixedValue; value uniform {k0}; }}
    outlet {{ type zeroGradient; }}
    wall {{ type kqRWallFunction; value uniform {k0}; }}
    wedgeFront {{ type wedge; }}
    wedgeBack {{ type wedge; }}
}}
""")

    _write(os.path.join(out_dir, "0", "epsilon"), f"""FoamFile
{{ version 2.0; format ascii; class volScalarField; object epsilon; }}
dimensions [0 2 -3 0 0 0 0];
internalField uniform {epsilon0};
boundaryField
{{
    inlet {{ type fixedValue; value uniform {epsilon0}; }}
    outlet {{ type zeroGradient; }}
    wall {{ type epsilonWallFunction; value uniform {epsilon0}; }}
    wedgeFront {{ type wedge; }}
    wedgeBack {{ type wedge; }}
}}
""")

    _write(os.path.join(out_dir, "0", "nut"), f"""FoamFile
{{ version 2.0; format ascii; class volScalarField; object nut; }}
dimensions [0 2 -1 0 0 0 0];
internalField uniform 0;
boundaryField
{{
    inlet {{ type calculated; value uniform 0; }}
    outlet {{ type calculated; value uniform 0; }}
    wall {{ type nutkRoughWallFunction; Ks uniform {roughness}; Cs uniform 0.5; value uniform 0; }}
    wedgeFront {{ type wedge; }}
    wedgeBack {{ type wedge; }}
}}
""")

    return PipeMeshInfo(n_radial=n_radial, n_axial=n_axial, diameter=diameter, length=length)
