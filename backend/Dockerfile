FROM python:3.11-slim

# Install the REAL CalculiX solver binary (ccx) from the Debian/Ubuntu
# package repos. This is the actual finite-element solver executable -
# not a stub, not a formula, an actual compiled physics solver.
RUN apt-get update && apt-get install -y --no-install-recommends \
    calculix-ccx \
    && rm -rf /var/lib/apt/lists/*

# Fail the build if ccx isn't actually on PATH - never ship an image that
# silently lacks the real solver.
RUN which ccx && ccx -v

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app

EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
