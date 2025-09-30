# DSS Engine - Decision Support System for FRA Patta and Village Scheme Recommendations

A FastAPI-based backend service that provides intelligent scheme recommendations for villages based on their socio-economic and infrastructural attributes.

## Features

- **15 Government Schemes**: Comprehensive coverage of major rural development schemes
- **Rule-based Recommendations**: Intelligent scoring system based on village attributes
- **RESTful API**: Clean and well-documented API endpoints
- **Mock Dataset**: 15 diverse villages with realistic attributes
- **Priority Scoring**: High, Medium, Low priority recommendations
- **Comprehensive Testing**: Unit tests for all components

## Schemes Included

1. **Jal Jeevan Mission** - Water & Sanitation
2. **MGNREGA** - Employment
3. **Pradhan Mantri Awas Yojana (PMAY)** - Housing
4. **Pradhan Mantri Gram Sadak Yojana (PMGSY)** - Infrastructure
5. **Pradhan Mantri Ujjwala Yojana** - Energy
6. **Pradhan Mantri Kisan Sampada Yojana** - Agriculture
7. **Pradhan Mantri Fasal Bima Yojana** - Agriculture
8. **Pradhan Mantri Jan Dhan Yojana** - Financial Inclusion
9. **Pradhan Mantri Mudra Yojana** - Financial Inclusion
10. **Pradhan Mantri Swachh Bharat Mission** - Sanitation
11. **Pradhan Mantri Kaushal Vikas Yojana** - Education & Skills
12. **Pradhan Mantri Gramin Digital Saksharta Abhiyan** - Digital India
13. **Pradhan Mantri Suraksha Bima Yojana** - Insurance
14. **Pradhan Mantri Jeevan Jyoti Bima Yojana** - Insurance
15. **Pradhan Mantri Van Dhan Vikas Yojana** - Forest & Tribal Development

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd dss
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### 1. Get Recommendations
```
GET /api/dss/recommend?village_id=<village_id>
```

**Example Request**:
```bash
curl "http://localhost:8000/api/dss/recommend?village_id=village_001"
```

**Example Response**:
```json
{
  "village_id": "village_001",
  "recommendations": [
    {
      "scheme": "Jal Jeevan Mission",
      "reason": "Very low water index (0.20)",
      "score": 0.9,
      "priority": "high",
      "description": "Providing tap water connection to every rural household",
      "estimated_cost": 50000,
      "duration_months": 24
    }
  ],
  "total_schemes": 1,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### 2. Get Available Villages
```
GET /api/dss/villages
```

### 3. Get Available Schemes
```
GET /api/dss/schemes
```

## Data Structure

### Village Attributes
- `village_id`: Unique identifier
- `village_name`: Name of the village
- `state`, `district`: Geographic location
- `population`: Total population
- `water_index`: Water availability (0-1 scale)
- `literacy_rate`: Literacy rate (0-1 scale)
- `employment_rate`: Employment rate (0-1 scale)
- `infrastructure_score`: Infrastructure quality (0-1 scale)
- `agricultural_land_percentage`: Agricultural land coverage (0-1 scale)
- `forest_coverage`: Forest coverage (0-1 scale)
- `poverty_index`: Poverty level (0-1 scale)
- `connectivity_score`: Connectivity quality (0-1 scale)
- `health_facilities`: Number of health facilities
- `education_facilities`: Number of education facilities
- `patta_count`: Number of FRA pattas

### Recommendation Scoring
The system uses a rule-based approach to calculate recommendation scores:

1. **Eligibility Check**: Verifies if village meets basic scheme criteria
2. **Factor Scoring**: Calculates scores based on priority factors
3. **Bonus Multipliers**: Applies additional bonuses for specific conditions
4. **Priority Assignment**: Assigns High/Medium/Low priority based on final score

## Testing

Run the test suite:
```bash
pytest tests/test_dss_engine.py -v
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
dss/
├── main.py                 # FastAPI application
├── models.py              # Pydantic models
├── dss_engine.py          # Core DSS logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── data/
│   ├── schemes.json      # 15 government schemes
│   └── villages.json     # 15 mock villages
├── docs/
│   └── api-contracts/
│       └── dss.json      # API contract documentation
└── tests/
    └── test_dss_engine.py # Unit tests
```

## Example Usage

### Python Client
```python
import requests

# Get recommendations for a village
response = requests.get("http://localhost:8000/api/dss/recommend?village_id=village_001")
recommendations = response.json()

for rec in recommendations["recommendations"]:
    print(f"Scheme: {rec['scheme']}")
    print(f"Reason: {rec['reason']}")
    print(f"Score: {rec['score']}")
    print(f"Priority: {rec['priority']}")
    print("---")
```

### JavaScript Client
```javascript
fetch('http://localhost:8000/api/dss/recommend?village_id=village_001')
  .then(response => response.json())
  .then(data => {
    console.log('Recommendations:', data.recommendations);
  });
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is part of the SIH FRA Platform and follows the project's licensing terms.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.
