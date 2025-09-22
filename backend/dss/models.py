from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Recommendation(BaseModel):
    scheme: str
    reason: str
    score: float
    priority: PriorityLevel
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    duration_months: Optional[int] = None

class VillageData(BaseModel):
    village_id: str
    village_name: str
    state: str
    district: str
    population: int
    water_index: float  # 0-1 scale (0 = very low, 1 = very high)
    literacy_rate: float  # 0-1 scale
    employment_rate: float  # 0-1 scale
    infrastructure_score: float  # 0-1 scale
    agricultural_land_percentage: float  # 0-1 scale
    forest_coverage: float  # 0-1 scale
    poverty_index: float  # 0-1 scale (0 = very poor, 1 = very rich)
    connectivity_score: float  # 0-1 scale
    health_facilities: int
    education_facilities: int
    patta_count: int

class DSSResponse(BaseModel):
    village_id: str
    recommendations: List[Recommendation]
    total_schemes: int
    generated_at: str
