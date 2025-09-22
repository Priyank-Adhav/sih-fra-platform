import pytest
import json
from fastapi.testclient import TestClient
from main import app
from dss_engine import DSSEngine
from models import VillageData

client = TestClient(app)

class TestDSSEngine:
    def setup_method(self):
        """Setup test data"""
        self.dss_engine = DSSEngine()
    
    def test_load_schemes(self):
        """Test loading schemes from JSON file"""
        schemes = self.dss_engine._load_schemes()
        assert len(schemes) == 15
        assert schemes[0]["scheme_id"] == "scheme_001"
        assert schemes[0]["name"] == "Jal Jeevan Mission"
    
    def test_load_villages(self):
        """Test loading villages from JSON file"""
        villages = self.dss_engine._load_villages()
        assert len(villages) == 15
        assert "village_001" in villages
        assert isinstance(villages["village_001"], VillageData)
    
    def test_get_available_villages(self):
        """Test getting available village IDs"""
        villages = self.dss_engine.get_available_villages()
        assert len(villages) == 15
        assert "village_001" in villages
        assert "village_015" in villages
    
    def test_get_available_schemes(self):
        """Test getting available schemes"""
        schemes = self.dss_engine.get_available_schemes()
        assert len(schemes) == 15
        assert schemes[0]["scheme_id"] == "scheme_001"
        assert schemes[0]["name"] == "Jal Jeevan Mission"
        assert schemes[0]["category"] == "Water & Sanitation"
    
    def test_get_recommendations_valid_village(self):
        """Test getting recommendations for a valid village"""
        recommendations = self.dss_engine.get_recommendations("village_001")
        assert len(recommendations) > 0
        assert len(recommendations) <= 10  # Should return max 10 recommendations
        
        # Check first recommendation structure
        first_rec = recommendations[0]
        assert hasattr(first_rec, 'scheme')
        assert hasattr(first_rec, 'reason')
        assert hasattr(first_rec, 'score')
        assert hasattr(first_rec, 'priority')
        assert 0 <= first_rec.score <= 1
    
    def test_get_recommendations_invalid_village(self):
        """Test getting recommendations for invalid village"""
        with pytest.raises(ValueError, match="Village with ID 'invalid_id' not found"):
            self.dss_engine.get_recommendations("invalid_id")
    
    def test_calculate_scheme_score_water_mission(self):
        """Test score calculation for Jal Jeevan Mission"""
        village = VillageData(
            village_id="test_village",
            village_name="Test Village",
            state="Test State",
            district="Test District",
            population=1000,
            water_index=0.1,  # Very low water index
            literacy_rate=0.5,
            employment_rate=0.4,
            infrastructure_score=0.3,
            agricultural_land_percentage=0.6,
            forest_coverage=0.2,
            poverty_index=0.3,
            connectivity_score=0.4,
            health_facilities=1,
            education_facilities=2,
            patta_count=100
        )
        
        scheme = {
            "scheme_id": "scheme_001",
            "name": "Jal Jeevan Mission",
            "description": "Providing tap water connection to every rural household",
            "category": "Water & Sanitation",
            "priority_factors": ["water_index", "population"],
            "eligibility_criteria": {
                "water_index": {"min": 0.0, "max": 0.4},
                "population": {"min": 100, "max": 10000}
            }
        }
        
        score, reason = self.dss_engine._calculate_scheme_score(scheme, village)
        assert score > 0.5  # Should have high score due to low water index
        assert "water index" in reason.lower()
    
    def test_determine_priority(self):
        """Test priority determination based on score"""
        assert self.dss_engine._determine_priority(0.9) == "high"
        assert self.dss_engine._determine_priority(0.6) == "medium"
        assert self.dss_engine._determine_priority(0.3) == "low"

class TestAPIEndpoints:
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "DSS Engine API is running"}
    
    def test_get_recommendations_endpoint(self):
        """Test recommendations endpoint"""
        response = client.get("/api/dss/recommend?village_id=village_001")
        assert response.status_code == 200
        
        data = response.json()
        assert "village_id" in data
        assert "recommendations" in data
        assert "total_schemes" in data
        assert "generated_at" in data
        assert data["village_id"] == "village_001"
        assert len(data["recommendations"]) > 0
    
    def test_get_recommendations_invalid_village(self):
        """Test recommendations endpoint with invalid village ID"""
        response = client.get("/api/dss/recommend?village_id=invalid_id")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
    
    def test_get_villages_endpoint(self):
        """Test villages endpoint"""
        response = client.get("/api/dss/villages")
        assert response.status_code == 200
        
        villages = response.json()
        assert isinstance(villages, list)
        assert len(villages) == 15
        assert "village_001" in villages
    
    def test_get_schemes_endpoint(self):
        """Test schemes endpoint"""
        response = client.get("/api/dss/schemes")
        assert response.status_code == 200
        
        schemes = response.json()
        assert isinstance(schemes, list)
        assert len(schemes) == 15
        
        # Check first scheme structure
        first_scheme = schemes[0]
        assert "scheme_id" in first_scheme
        assert "name" in first_scheme
        assert "category" in first_scheme

class TestRecommendationLogic:
    def test_water_mission_high_priority(self):
        """Test that Jal Jeevan Mission gets high priority for villages with low water index"""
        dss_engine = DSSEngine()
        recommendations = dss_engine.get_recommendations("village_001")  # Has water_index = 0.2
        
        # Find Jal Jeevan Mission in recommendations
        water_mission = next((rec for rec in recommendations if "Jal Jeevan Mission" in rec.scheme), None)
        assert water_mission is not None
        assert water_mission.score >= 0.7
        assert water_mission.priority in ["high", "medium"]
    
    def test_mgnrega_high_priority(self):
        """Test that MGNREGA gets high priority for villages with high poverty and low employment"""
        dss_engine = DSSEngine()
        recommendations = dss_engine.get_recommendations("village_002")  # Has poverty_index = 0.2, employment_rate = 0.25
        
        # Find MGNREGA in recommendations
        mgnrega = next((rec for rec in recommendations if "MGNREGA" in rec.scheme), None)
        assert mgnrega is not None
        assert mgnrega.score > 0.6
        assert mgnrega.priority in ["high", "medium"]
    
    def test_forest_schemes_priority(self):
        """Test that forest-related schemes get priority for villages with high forest coverage"""
        dss_engine = DSSEngine()
        recommendations = dss_engine.get_recommendations("village_015")  # Has forest_coverage = 0.9
        
        # Find forest-related schemes
        forest_schemes = [rec for rec in recommendations if "Van Dhan" in rec.scheme or "forest" in rec.scheme.lower()]
        if forest_schemes:
            assert forest_schemes[0].score > 0.5

if __name__ == "__main__":
    pytest.main([__file__])
