# Feature Guide: FRA Atlas Frontend

**Branch Name:** `feature/atlas-frontend`

**Purpose:**
Build an interactive web map UI to visualize the FRA Atlas polygons and village boundaries, with polygon drawing, editing, and export capabilities. This frontend will later integrate with the backend, dashboard, and other modules.

---

## Deliverables

### 1. Frontend Skeleton

* React + TypeScript project using Vite.
* Organize folders for `components`, `pages`, `services`, `styles`.
* README.md explaining project structure and how to run locally.
* Use Tailwind CSS for basic styling.

### 2. Map Visualization

* Use Leaflet or OpenLayers for map rendering.
* Display layers:

  * FRA polygons (forest, water, agriculture, settlements)
  * Village boundaries
* Map controls:

  * Zoom, pan
  * Layer toggle for visibility
* Polygon editor:

  * Draw new polygons
  * Edit existing polygons (mock save for now)
  * Delete polygons (mock delete)

### 3. API Integration (Mocked)

* Use JSON mock data following `docs/api-contracts/atlas.json`.
* Simulate GET/POST/PUT/DELETE operations using frontend service layer.
* Ensure polygon coordinates render correctly in order.

### 4. Export Functionality

* Allow users to export map snapshot as an image or PDF (mock acceptable for MVP).

### 5. Independent Assumptions

* No real backend required yet; use static/mock GeoJSON.
* Styling and color coding for polygon types can be hard-coded.
* Focus on making UI functional and visually representative.

### 6. Success Criteria

* Map renders polygons and village boundaries correctly from mock data.
* Polygon drawing/editing/deletion works locally.
* Layers can be toggled on/off.
* Export feature functions (even with mock content).
* Frontend is ready to integrate with backend API later without breaking the layout.
