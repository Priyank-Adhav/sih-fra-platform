# Feature Guide: FRA Atlas Backend

**Branch Name:** `feature/atlas-backend`

**Purpose:**
Provide geospatial API and storage for the FRA Atlas polygons and village boundaries, including endpoints for CRUD operations and serving GeoJSON to frontend applications. This backend will later integrate with the dashboard, DSS engine, and document management modules.

---

## Deliverables

### 1. Backend Skeleton

* FastAPI project structure with separate folders for `api`, `models`, `services`, `tests`.
* Include a README.md explaining endpoints and running instructions.
* Use Pydantic models for request/response validation.

### 2. Database

* PostgreSQL + PostGIS for spatial storage.
* Tables required:

  * `villages`: id, name, state, district, geometry (polygon)
  * `polygons`: id, village\_id (FK), claim\_type, status, geometry, created\_at, updated\_at, provenance fields (user, model\_version)
* Seed the database with **demo shapefiles** for 1-2 villages per target state (MP, Odisha, Telangana, Tripura).
* Ensure proper SRID (e.g., 4326) for coordinate consistency.

### 3. API Endpoints

* `GET /api/polygons`: return all polygons in GeoJSON FeatureCollection format.
* `POST /api/polygons`: create a new polygon (accepts GeoJSON Feature payload with properties).
* `GET /api/polygons/{id}`: retrieve a single polygon.
* `PUT /api/polygons/{id}`: update a polygon.
* `DELETE /api/polygons/{id}`: remove a polygon.

**Notes:**

* Follow the schema defined in `docs/api-contracts/atlas.json`.
* Include mock data for properties (village, state, claimType, status).

### 4. Success Criteria

* Backend runs independently and serves polygon data as per GeoJSON schema.
* Endpoints are tested and functioning.
* Demo polygons from target states are stored and retrievable.
* Ready to merge with frontend, dashboard, and later modules.
