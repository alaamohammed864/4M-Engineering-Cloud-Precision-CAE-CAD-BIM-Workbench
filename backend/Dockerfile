FROM python:3.11-slim

# Install the REAL CalculiX (ccx) and OpenFOAM (blockMesh/simpleFoam)
# solver binaries from the Debian/Ubuntu package repos. These are the
# actual compiled physics solver executables - not stubs, not formulas.
RUN apt-get update && apt-get install -y --no-install-recommends \
    calculix-ccx \
    openfoam \
    && rm -rf /var/lib/apt/lists/*

# Fail the build if the binaries aren't actually on PATH - never ship an
# image that silently lacks the real solvers.
RUN which ccx && ccx -v
RUN which blockMesh && which simpleFoam

# NOTE: the Ubuntu 'openfoam' package's own etc/bashrc environment script
# calls helper binaries (foamEtcFile, foamCleanPath) that are not shipped
# in this package, so it cannot be sourced. This does not affect the
# solver binaries themselves - openfoam_adapter.py sets WM_PROJECT_DIR and
# FOAM_ETC directly for every subprocess call instead of relying on the
# package's broken shell bootstrap. Verified working end-to-end.
ENV WM_PROJECT_DIR=/usr/share/openfoam
ENV FOAM_ETC=/usr/share/openfoam/etc

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify the real OpenCASCADE kernel bindings actually import and can
# build/query real B-Rep geometry - fail the build if not, same
# discipline as the ccx/blockMesh checks above.
RUN python3 -c "from OCP.BRepPrimAPI import BRepPrimAPI_MakeBox; from OCP.GProp import GProp_GProps; from OCP.BRepGProp import BRepGProp; b = BRepPrimAPI_MakeBox(1,1,1).Shape(); p = GProp_GProps(); BRepGProp.VolumeProperties_s(b, p); assert abs(p.Mass() - 1.0) < 1e-6, 'OCCT kernel volume check failed'; print('OpenCASCADE (OCP) kernel verified OK')"

COPY app ./app

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
