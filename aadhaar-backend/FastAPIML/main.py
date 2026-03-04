from fastapi import FastAPI
from pipelines import run_all_pipelines

app = FastAPI()

@app.post("/run-pipeline")
def run_pipeline(payload: dict):
    run_all_pipelines(payload)
    return {"status": "ML pipeline executed"}
