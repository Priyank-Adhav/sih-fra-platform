from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
import os
from datetime import datetime
from pydantic import BaseModel
from dss_engine import DSSEngine
from models import VillageData, Recommendation, DSSResponse

app = FastAPI(
    title="DSS Engine API",
    description="Decision Support System for FRA Patta and Village Scheme Recommendations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DSS Engine
dss_engine = DSSEngine()

@app.get("/")
async def root():
    return {"message": "DSS Engine API is running"}

@app.get("/api/dss/recommend", response_model=DSSResponse)
async def get_recommendations(
    village_id: str = Query(..., description="Village ID to get recommendations for")
):
    """
    Get scheme recommendations for a specific village based on its attributes.
    """
    try:
        recommendations = dss_engine.get_recommendations(village_id)
        return DSSResponse(
            village_id=village_id,
            recommendations=recommendations,
            total_schemes=len(recommendations),
            generated_at=datetime.now().isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/dss/villages")
async def get_available_villages():
    """
    Get list of available villages in the dataset.
    """
    return dss_engine.get_available_villages()

@app.get("/api/dss/villages/names")
async def get_village_names():
    """
    Get list of village names with their IDs.
    """
    try:
        return dss_engine.get_village_names_with_details()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching village names: {str(e)}")

@app.get("/api/dss/villages/names-only")
async def get_village_names_only():
    """
    Get list of village names only.
    """
    try:
        return dss_engine.get_village_names_only()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching village names: {str(e)}")

@app.get("/api/dss/schemes")
async def get_available_schemes():
    """
    Get list of available schemes.
    """
    return dss_engine.get_available_schemes()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
