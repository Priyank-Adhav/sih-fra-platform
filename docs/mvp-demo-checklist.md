# MVP Demo Checklist

This checklist outlines the step-by-step tasks for building the FRA Atlas & DSS MVP.  
Mark each task with a checkmark `[x]` once completed.  

---

## Repository & Infrastructure Setup
- [ ] Initialize monorepo structure (`fra-atlas-dss/`)
- [ ] Add `.gitignore` and `.gitattributes`
- [ ] Setup Docker and docker-compose with Postgres + PostGIS
- [ ] Add README with project overview and setup steps

## FRA Atlas
- [ ] Backend scaffold (FastAPI + PostGIS connection)
- [ ] Endpoint to serve polygons (mock GeoJSON)
- [ ] Frontend scaffold (React + TypeScript + Vite)
- [ ] Render base map (OpenStreetMap tiles)
- [ ] Display polygons from backend
- [ ] Add layer controls (toggle IFR/CR/CFR, village boundaries, land-use)
- [ ] Add polygon editing (manual corrections, save back to backend)
- [ ] Add sidebar UI (metadata display, claim info)
- [ ] Unit tests for atlas backend (polygon CRUD, tile serving)

## Dashboard Integration
- [ ] Scaffold unified dashboard frontend
- [ ] Embed FRA Atlas map as a module in dashboard
- [ ] Role-based login (Admin, State, District, Village)
- [ ] Sidebar tabs for Documents, DSS, Health Alerts
- [ ] Dashboard widgets (claims progress, scheme coverage, alerts count)

## DSS Engine
- [ ] Backend DSS service scaffold
- [ ] Mock recommendation system using sample rules
- [ ] Integrate Gemini API for placeholder AI logic
- [ ] API endpoint for DSS recommendations
- [ ] Dashboard tab for DSS outputs (tables + charts)

## Document Management
- [ ] Backend document upload endpoint
- [ ] OCR integration (Tesseract baseline)
- [ ] Metadata extraction (NER for village names, claim status, etc.)
- [ ] Store raw documents + extracted metadata
- [ ] Legal bundle generator (signed PDF + GeoPackage + QR link)
- [ ] Dashboard tab for viewing & uploading documents

## AI/ML & Asset Mapping
- [ ] Create data pipeline for satellite imagery (Sentinel/Landsat)
- [ ] Prototype CV model for land classification (forest, water, farmland, settlements)
- [ ] Train/test supervised ML classifier (Random Forest / CNN)
- [ ] Integrate model predictions into Atlas as a layer
- [ ] Add manual editing tools for model output
- [ ] Document accuracy limits and retraining plan

## Forest Health Alerts
- [ ] Fetch MODIS thermal anomaly data
- [ ] Compute NDVI/NDWI indices from Sentinel
- [ ] Change detection pipeline (deforestation, disturbance)
- [ ] Generate alert events in backend
- [ ] Dashboard feed for alerts (sortable/filterable)
- [ ] Map overlay for alerts (heatmap/points)

## Blockchain & Provenance 
- [ ] Scaffold blockchain/ledger integration module
- [ ] Generate SHA256 file/document hashes
- [ ] Store hashes and metadata on blockchain (mock/demo mode first)
- [ ] QR code linking to blockchain hash for legal bundles
- [ ] API to verify document authenticity
- [ ] Dashboard integration: “Verify Document” button

## Mobile App / PWA
- [ ] Scaffold offline-first PWA
- [ ] Implement local storage (IndexedDB/SQLite)
- [ ] FRA claim form UI (multilingual support)
- [ ] Polygon drawing on mobile map
- [ ] Sync mechanism with backend
- [ ] Gram Sabha vote capture UI

## Governance & Privacy Features
- [ ] Role-based access control in backend
- [ ] Consent capture for personal data ingestion
- [ ] Audit logging of user actions
- [ ] Data export functionality (claims, shapefiles, PDFs)
- [ ] Model + data versioning governance docs

---

## Demo Prep
- [ ] MVP walkthrough script
- [ ] Demo dataset preparation (mock shapefiles, sample documents)
- [ ] Slides with visuals and 1-line explanations
- [ ] Checklist-to-demo mapping (UI actions -> backend calls)