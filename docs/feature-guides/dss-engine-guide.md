# Feature Guide: DSS Engine

**Branch Name:** `feature/dss-engine`

**Purpose:**
Build the Decision Support System (DSS) backend to provide scheme recommendations for FRA pattas and villages. The frontend tab will be handled by the dashboard developer; this branch focuses solely on the API and backend logic.

---

## Deliverables

### 1. Backend

* FastAPI project structure with endpoints:

  * `GET /api/dss/recommend?village_id=<id>`: returns JSON list of recommended schemes with reasons and priority scores.
* Implement rule-based logic for MVP:

  * Example: low water index → prioritize Jal Jeevan Mission.
* Optional: integrate Gemini/OpenAI API for textual explanation of recommendations.
* Unit tests for endpoints.

### 2. API Contract

* Create `docs/api-contracts/dss.json` defining:

  * Endpoint paths, HTTP methods, request parameters, and response schema.
  * Example response:

```json
{
  "village_id": "village-123",
  "recommendations": [
    {
      "scheme": "Jal Jeevan Mission",
      "reason": "Low water index",
      "score": 0.9
    },
    {
      "scheme": "MGNREGA",
      "reason": "High labor availability",
      "score": 0.7
    }
  ]
}
```

### 3. Independent Assumptions

* Use static/mock JSON or CSV for village/patta data.
* Rules can be simplified for MVP.
* Frontend will consume API separately; no frontend code needed here.
* Gemini/OpenAI calls can be mocked if unavailable.

### 4. Success Criteria

* DSS API returns valid JSON responses as per contract.
* Rule-based recommendations are consistent with mock data.
* Backend can run independently and is ready for dashboard integration.
