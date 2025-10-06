"""
Land Claims Analytics FastAPI Backend
Provides RESTful APIs for analyzing land claims data from PostgreSQL database.
"""

from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from dotenv import load_dotenv
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


# SQLAlchemy Models
class Base(DeclarativeBase):
    pass


class LandClaimsObservation(Base):
    __tablename__ = "land_claims_observation"

    id: Mapped[int] = mapped_column(primary_key=True)
    state: Mapped[str]
    snapshot_date: Mapped[date]
    claims_individual: Mapped[Optional[int]]
    claims_community: Mapped[Optional[int]]
    titles_individual: Mapped[Optional[int]]
    titles_community: Mapped[Optional[int]]
    claims_rejected: Mapped[Optional[int]]
    claims_disposed: Mapped[Optional[int]]
    pct_disposed: Mapped[Optional[Decimal]]
    pct_titles_distributed: Mapped[Optional[Decimal]]
    forest_land_individual_acres: Mapped[Optional[Decimal]]
    forest_land_community_acres: Mapped[Optional[Decimal]]
    created_at: Mapped[Optional[datetime]]


# Pydantic Models
class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    state: str
    snapshot_date: date
    claims_individual: Optional[int] = None
    claims_community: Optional[int] = None
    titles_individual: Optional[int] = None
    titles_community: Optional[int] = None
    claims_rejected: Optional[int] = None
    claims_disposed: Optional[int] = None
    pct_disposed: Optional[float] = None
    pct_titles_distributed: Optional[float] = None
    forest_land_individual_acres: Optional[float] = None
    forest_land_community_acres: Optional[float] = None


class StateResponse(BaseModel):
    state: str
    observation_count: int
    latest_snapshot_date: Optional[date] = None


class SnapshotSummaryResponse(BaseModel):
    snapshot_date: date
    total_states: int
    total_claims_individual: int
    total_claims_community: int
    total_claims: int
    total_titles_individual: int
    total_titles_community: int
    total_titles: int
    total_claims_rejected: int
    total_claims_disposed: int
    avg_pct_disposed: Optional[float] = None
    avg_pct_titles_distributed: Optional[float] = None
    total_forest_land_individual_acres: float
    total_forest_land_community_acres: float
    total_forest_land_acres: float


class StateComparisonResponse(BaseModel):
    state: str
    date1: date
    date2: date
    claims_individual_diff: Optional[int] = None
    claims_community_diff: Optional[int] = None
    titles_individual_diff: Optional[int] = None
    titles_community_diff: Optional[int] = None
    claims_rejected_diff: Optional[int] = None
    forest_land_individual_diff: Optional[float] = None
    forest_land_community_diff: Optional[float] = None
    pct_disposed_diff: Optional[float] = None
    pct_titles_distributed_diff: Optional[float] = None


class TopStateResponse(BaseModel):
    rank: int
    state: str
    snapshot_date: date
    metric_value: Optional[float] = None
    metric_name: str


class RejectionAnalysisResponse(BaseModel):
    state: str
    snapshot_date: date
    total_claims: int
    claims_rejected: int
    rejection_rate: Optional[float] = None


class TrendDataPoint(BaseModel):
    snapshot_date: date
    value: float


class StateTrendResponse(BaseModel):
    state: str
    metric_name: str
    data_points: List[TrendDataPoint]


class ClaimsTitlesDistributionResponse(BaseModel):
    state: str
    snapshot_date: date
    total_claims: int
    total_titles: int
    titles_issued_pct: Optional[float] = None
    claims_pending: int


# FastAPI App
app = FastAPI(
    title="Land Claims Analytics API",
    description="RESTful API for analyzing land claims and forest rights data",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session dependency
async def get_session():
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Land Claims Analytics API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")


# Endpoint 1: List all states
@app.get("/states", response_model=List[StateResponse])
async def get_states():
    """Get list of all states with observation counts and latest snapshot date."""
    try:
        async with async_session_maker() as session:
            query = text(
                """
                SELECT 
                    state,
                    COUNT(*) as observation_count,
                    MAX(snapshot_date) as latest_snapshot_date
                FROM land_claims_observation
                GROUP BY state
                ORDER BY state
            """
            )
            result = await session.execute(query)
            rows = result.fetchall()

            return [
                StateResponse(
                    state=row[0], observation_count=row[1], latest_snapshot_date=row[2]
                )
                for row in rows
            ]
    except Exception as e:
        logger.error(f"Error fetching states: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 2: Get all observations with optional filters
@app.get("/observations", response_model=List[ObservationResponse])
async def get_observations(
    state: Optional[str] = Query(None, description="Filter by state name"),
    snapshot_date: Optional[date] = Query(None, description="Filter by snapshot date"),
    start_date: Optional[date] = Query(None, description="Filter from start date"),
    end_date: Optional[date] = Query(None, description="Filter to end date"),
    limit: int = Query(100, ge=1, le=1000, description="Limit number of results"),
):
    """Get observations with optional filters."""
    try:
        async with async_session_maker() as session:
            conditions = []
            params = {}

            if state:
                conditions.append("state = :state")
                params["state"] = state

            if snapshot_date:
                conditions.append("snapshot_date = :snapshot_date")
                params["snapshot_date"] = snapshot_date

            if start_date:
                conditions.append("snapshot_date >= :start_date")
                params["start_date"] = start_date

            if end_date:
                conditions.append("snapshot_date <= :end_date")
                params["end_date"] = end_date

            where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""

            query = text(
                f"""
                SELECT * FROM land_claims_observation
                {where_clause}
                ORDER BY snapshot_date DESC, state
                LIMIT :limit
            """
            )
            params["limit"] = limit

            result = await session.execute(query, params)
            rows = result.fetchall()

            return [
                ObservationResponse(
                    id=row[0],
                    state=row[1],
                    snapshot_date=row[2],
                    claims_individual=row[3],
                    claims_community=row[4],
                    titles_individual=row[5],
                    titles_community=row[6],
                    claims_rejected=row[7],
                    claims_disposed=row[8],
                    pct_disposed=float(row[9]) if row[9] else None,
                    pct_titles_distributed=float(row[10]) if row[10] else None,
                    forest_land_individual_acres=float(row[11]) if row[11] else None,
                    forest_land_community_acres=float(row[12]) if row[12] else None,
                )
                for row in rows
            ]
    except Exception as e:
        logger.error(f"Error fetching observations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 3: Snapshot summary
@app.get(
    "/analytics/snapshot-summary/{snapshot_date}",
    response_model=SnapshotSummaryResponse,
)
async def get_snapshot_summary(
    snapshot_date: date = Path(..., description="Snapshot date (YYYY-MM-DD)")
):
    """Get aggregated metrics for a specific snapshot date."""
    try:
        async with async_session_maker() as session:
            query = text(
                """
                SELECT 
                    COUNT(DISTINCT state) as total_states,
                    COALESCE(SUM(claims_individual), 0) as total_claims_individual,
                    COALESCE(SUM(claims_community), 0) as total_claims_community,
                    COALESCE(SUM(titles_individual), 0) as total_titles_individual,
                    COALESCE(SUM(titles_community), 0) as total_titles_community,
                    COALESCE(SUM(claims_rejected), 0) as total_claims_rejected,
                    COALESCE(SUM(claims_disposed), 0) as total_claims_disposed,
                    AVG(pct_disposed) as avg_pct_disposed,
                    AVG(pct_titles_distributed) as avg_pct_titles_distributed,
                    COALESCE(SUM(forest_land_individual_acres), 0) as total_forest_individual,
                    COALESCE(SUM(forest_land_community_acres), 0) as total_forest_community
                FROM land_claims_observation
                WHERE snapshot_date = :snapshot_date
            """
            )

            result = await session.execute(query, {"snapshot_date": snapshot_date})
            row = result.fetchone()

            if not row or row[0] == 0:
                raise HTTPException(
                    status_code=404, detail=f"No data found for date {snapshot_date}"
                )

            total_claims = row[1] + row[2]
            total_titles = row[3] + row[4]

            return SnapshotSummaryResponse(
                snapshot_date=snapshot_date,
                total_states=row[0],
                total_claims_individual=row[1],
                total_claims_community=row[2],
                total_claims=total_claims,
                total_titles_individual=row[3],
                total_titles_community=row[4],
                total_titles=total_titles,
                total_claims_rejected=row[5],
                total_claims_disposed=row[6],
                avg_pct_disposed=float(row[7]) if row[7] else None,
                avg_pct_titles_distributed=float(row[8]) if row[8] else None,
                total_forest_land_individual_acres=float(row[9]),
                total_forest_land_community_acres=float(row[10]),
                total_forest_land_acres=float(row[9]) + float(row[10]),
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching snapshot summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 4: Compare two snapshot dates
@app.get("/analytics/compare", response_model=List[StateComparisonResponse])
async def compare_snapshots(
    date1: date = Query(..., description="First snapshot date"),
    date2: date = Query(..., description="Second snapshot date"),
):
    """Compare data between two snapshot dates for all states."""
    try:
        async with async_session_maker() as session:
            query = text(
                """
                SELECT 
                    COALESCE(d1.state, d2.state) as state,
                    d1.claims_individual - COALESCE(d2.claims_individual, 0) as claims_individual_diff,
                    d1.claims_community - COALESCE(d2.claims_community, 0) as claims_community_diff,
                    d1.titles_individual - COALESCE(d2.titles_individual, 0) as titles_individual_diff,
                    d1.titles_community - COALESCE(d2.titles_community, 0) as titles_community_diff,
                    d1.claims_rejected - COALESCE(d2.claims_rejected, 0) as claims_rejected_diff,
                    d1.forest_land_individual_acres - COALESCE(d2.forest_land_individual_acres, 0) as forest_individual_diff,
                    d1.forest_land_community_acres - COALESCE(d2.forest_land_community_acres, 0) as forest_community_diff,
                    d1.pct_disposed - COALESCE(d2.pct_disposed, 0) as pct_disposed_diff,
                    d1.pct_titles_distributed - COALESCE(d2.pct_titles_distributed, 0) as pct_titles_diff
                FROM 
                    (SELECT * FROM land_claims_observation WHERE snapshot_date = :date1) d1
                FULL OUTER JOIN 
                    (SELECT * FROM land_claims_observation WHERE snapshot_date = :date2) d2
                ON d1.state = d2.state
                ORDER BY state
            """
            )

            result = await session.execute(query, {"date1": date1, "date2": date2})
            rows = result.fetchall()

            if not rows:
                raise HTTPException(
                    status_code=404, detail="No data found for comparison dates"
                )

            return [
                StateComparisonResponse(
                    state=row[0],
                    date1=date1,
                    date2=date2,
                    claims_individual_diff=row[1],
                    claims_community_diff=row[2],
                    titles_individual_diff=row[3],
                    titles_community_diff=row[4],
                    claims_rejected_diff=row[5],
                    forest_land_individual_diff=float(row[6]) if row[6] else None,
                    forest_land_community_diff=float(row[7]) if row[7] else None,
                    pct_disposed_diff=float(row[8]) if row[8] else None,
                    pct_titles_distributed_diff=float(row[9]) if row[9] else None,
                )
                for row in rows
            ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing snapshots: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 5: Top states by metric
@app.get("/analytics/top-states", response_model=List[TopStateResponse])
async def get_top_states(
    metric: str = Query(
        ..., description="Metric name (e.g., claims_individual, titles_community)"
    ),
    top: int = Query(5, ge=1, le=50, description="Number of top states to return"),
    snapshot_date: Optional[date] = Query(
        None, description="Specific snapshot date (latest if not provided)"
    ),
):
    """Get top N states by a specified metric."""
    valid_metrics = [
        "claims_individual",
        "claims_community",
        "titles_individual",
        "titles_community",
        "claims_rejected",
        "claims_disposed",
        "pct_disposed",
        "pct_titles_distributed",
        "forest_land_individual_acres",
        "forest_land_community_acres",
    ]

    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Choose from: {', '.join(valid_metrics)}",
        )

    try:
        async with async_session_maker() as session:
            date_filter = (
                "snapshot_date = :snapshot_date"
                if snapshot_date
                else "snapshot_date = (SELECT MAX(snapshot_date) FROM land_claims_observation)"
            )

            query = text(
                f"""
                SELECT 
                    state,
                    snapshot_date,
                    {metric} as metric_value
                FROM land_claims_observation
                WHERE {date_filter}
                    AND {metric} IS NOT NULL
                ORDER BY {metric} DESC
                LIMIT :top
            """
            )

            params = {"top": top}
            if snapshot_date:
                params["snapshot_date"] = snapshot_date

            result = await session.execute(query, params)
            rows = result.fetchall()

            if not rows:
                raise HTTPException(
                    status_code=404, detail="No data found for the specified criteria"
                )

            return [
                TopStateResponse(
                    rank=idx + 1,
                    state=row[0],
                    snapshot_date=row[1],
                    metric_value=float(row[2]) if row[2] is not None else None,
                    metric_name=metric,
                )
                for idx, row in enumerate(rows)
            ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching top states: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 6: Rejection analysis
@app.get(
    "/analytics/rejection-analysis", response_model=List[RejectionAnalysisResponse]
)
async def get_rejection_analysis(
    snapshot_date: Optional[date] = Query(None, description="Specific snapshot date"),
    min_rejection_rate: float = Query(
        0, ge=0, le=100, description="Minimum rejection rate filter"
    ),
):
    """Analyze claim rejection rates by state."""
    try:
        async with async_session_maker() as session:
            date_filter = (
                "snapshot_date = :snapshot_date"
                if snapshot_date
                else "snapshot_date = (SELECT MAX(snapshot_date) FROM land_claims_observation)"
            )

            query = text(
                f"""
                SELECT 
                    state,
                    snapshot_date,
                    COALESCE(claims_individual, 0) + COALESCE(claims_community, 0) as total_claims,
                    COALESCE(claims_rejected, 0) as claims_rejected,
                    CASE 
                        WHEN (COALESCE(claims_individual, 0) + COALESCE(claims_community, 0)) > 0 
                        THEN (COALESCE(claims_rejected, 0)::float / (COALESCE(claims_individual, 0) + COALESCE(claims_community, 0)) * 100)
                        ELSE NULL
                    END as rejection_rate
                FROM land_claims_observation
                WHERE {date_filter}
                ORDER BY rejection_rate DESC NULLS LAST
            """
            )

            params = {}
            if snapshot_date:
                params["snapshot_date"] = snapshot_date

            result = await session.execute(query, params)
            rows = result.fetchall()

            return [
                RejectionAnalysisResponse(
                    state=row[0],
                    snapshot_date=row[1],
                    total_claims=row[2],
                    claims_rejected=row[3],
                    rejection_rate=float(row[4]) if row[4] is not None else None,
                )
                for row in rows
                if row[4] is None or row[4] >= min_rejection_rate
            ]
    except Exception as e:
        logger.error(f"Error in rejection analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 7: State trends over time
@app.get("/analytics/state-trends/{state}", response_model=StateTrendResponse)
async def get_state_trends(
    state: str = Path(..., description="State name"),
    metric: str = Query(..., description="Metric to track over time"),
):
    """Get trend data for a specific state and metric over all available dates."""
    valid_metrics = [
        "claims_individual",
        "claims_community",
        "titles_individual",
        "titles_community",
        "claims_rejected",
        "pct_disposed",
        "pct_titles_distributed",
        "forest_land_individual_acres",
        "forest_land_community_acres",
    ]

    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Choose from: {', '.join(valid_metrics)}",
        )

    try:
        async with async_session_maker() as session:
            query = text(
                f"""
                SELECT 
                    snapshot_date,
                    {metric} as value
                FROM land_claims_observation
                WHERE state = :state
                    AND {metric} IS NOT NULL
                ORDER BY snapshot_date
            """
            )

            result = await session.execute(query, {"state": state})
            rows = result.fetchall()

            if not rows:
                raise HTTPException(
                    status_code=404, detail=f"No data found for state: {state}"
                )

            return StateTrendResponse(
                state=state,
                metric_name=metric,
                data_points=[
                    TrendDataPoint(snapshot_date=row[0], value=float(row[1]))
                    for row in rows
                ],
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching state trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 8: Claims vs Titles distribution (for pie chart)
@app.get(
    "/analytics/claims-titles-distribution",
    response_model=List[ClaimsTitlesDistributionResponse],
)
async def get_claims_titles_distribution(
    snapshot_date: Optional[date] = Query(None, description="Specific snapshot date")
):
    """Get claims vs titles distribution for visualization."""
    try:
        async with async_session_maker() as session:
            date_filter = (
                "snapshot_date = :snapshot_date"
                if snapshot_date
                else "snapshot_date = (SELECT MAX(snapshot_date) FROM land_claims_observation)"
            )

            query = text(
                f"""
                SELECT 
                    state,
                    snapshot_date,
                    COALESCE(claims_individual, 0) + COALESCE(claims_community, 0) as total_claims,
                    COALESCE(titles_individual, 0) + COALESCE(titles_community, 0) as total_titles
                FROM land_claims_observation
                WHERE {date_filter}
                ORDER BY state
            """
            )

            params = {}
            if snapshot_date:
                params["snapshot_date"] = snapshot_date

            result = await session.execute(query, params)
            rows = result.fetchall()

            return [
                ClaimsTitlesDistributionResponse(
                    state=row[0],
                    snapshot_date=row[1],
                    total_claims=row[2],
                    total_titles=row[3],
                    titles_issued_pct=(row[3] / row[2] * 100) if row[2] > 0 else None,
                    claims_pending=row[2] - row[3],
                )
                for row in rows
            ]
    except Exception as e:
        logger.error(f"Error fetching claims-titles distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 9: Forest land distribution summary
@app.get("/analytics/forest-land-summary")
async def get_forest_land_summary(
    snapshot_date: Optional[date] = Query(None, description="Specific snapshot date")
):
    """Get forest land distribution summary for bar charts."""
    try:
        async with async_session_maker() as session:
            date_filter = (
                "snapshot_date = :snapshot_date"
                if snapshot_date
                else "snapshot_date = (SELECT MAX(snapshot_date) FROM land_claims_observation)"
            )

            query = text(
                f"""
                SELECT 
                    state,
                    snapshot_date,
                    COALESCE(forest_land_individual_acres, 0) as individual_acres,
                    COALESCE(forest_land_community_acres, 0) as community_acres,
                    COALESCE(forest_land_individual_acres, 0) + COALESCE(forest_land_community_acres, 0) as total_acres
                FROM land_claims_observation
                WHERE {date_filter}
                ORDER BY total_acres DESC
            """
            )

            params = {}
            if snapshot_date:
                params["snapshot_date"] = snapshot_date

            result = await session.execute(query, params)
            rows = result.fetchall()

            return [
                {
                    "state": row[0],
                    "snapshot_date": row[1].isoformat(),
                    "individual_acres": float(row[2]),
                    "community_acres": float(row[3]),
                    "total_acres": float(row[4]),
                }
                for row in rows
            ]
    except Exception as e:
        logger.error(f"Error fetching forest land summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint 10: Overall statistics
@app.get("/analytics/overall-stats")
async def get_overall_stats():
    """Get overall statistics across all dates and states."""
    try:
        async with async_session_maker() as session:
            query = text(
                """
                SELECT 
                    COUNT(DISTINCT state) as total_states,
                    COUNT(DISTINCT snapshot_date) as total_snapshots,
                    MIN(snapshot_date) as earliest_date,
                    MAX(snapshot_date) as latest_date,
                    SUM(COALESCE(claims_individual, 0) + COALESCE(claims_community, 0)) as total_claims,
                    SUM(COALESCE(titles_individual, 0) + COALESCE(titles_community, 0)) as total_titles,
                    SUM(COALESCE(claims_rejected, 0)) as total_rejected,
                    SUM(COALESCE(forest_land_individual_acres, 0) + COALESCE(forest_land_community_acres, 0)) as total_forest_land
                FROM land_claims_observation
            """
            )

            result = await session.execute(query)
            row = result.fetchone()

            return {
                "total_states": row[0],
                "total_snapshots": row[1],
                "earliest_date": row[2].isoformat() if row[2] else None,
                "latest_date": row[3].isoformat() if row[3] else None,
                "total_claims": row[4],
                "total_titles": row[5],
                "total_rejected": row[6],
                "total_forest_land_acres": float(row[7]) if row[7] else 0,
            }
    except Exception as e:
        logger.error(f"Error fetching overall stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
