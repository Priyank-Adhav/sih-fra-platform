# SIH FRA Platform

**AI-powered FRA Atlas and WebGIS-based Decision Support System (DSS) for Integrated Monitoring of Forest Rights Act (FRA) Implementation**

---

## 1. Project Overview

This project digitizes and standardizes legacy FRA (Forest Rights Act, 2006) data, integrates it with satellite imagery, and provides an interactive WebGIS portal along with a Decision Support System (DSS) for informed policy-making.

**Main objectives:**

* Create a centralized FRA Atlas for visualizing potential and granted FRA areas.
* Use AI/ML and Remote Sensing to map capital and social assets in FRA villages.
* Enable scheme-layering for CSS programs (PM-KISAN, Jal Jeevan Mission, MGNREGA, DAJGUA) via a DSS engine.
* Target States: Madhya Pradesh, Tripura, Odisha, Telangana.

**Target Users:** Ministry of Tribal Affairs, District-level Tribal Welfare Departments, Forest/Revenue Departments, Planning Authorities, and NGOs.

---

## 2. Directory Structure

```
backend/atlas        # Atlas backend API
backend/dss          # DSS engine API
backend/document     # Document processing API (OCR + NER)
frontend/dashboard   # React frontend (WebGIS dashboard)
infra/docker/initdb  # Database initialization scripts
docs                 # API contracts and feature guides
run.sh               # Unified script to start all services
.env_example         # Template for environment variables
```

---

## 3. Prerequisites

* Python 3.11+
* Node.js 20+
* npm (for frontend)
* PostgreSQL 15 with PostGIS extension

---

## 4. Environment Setup

1. Copy the template `.env_example` to `.env` and fill in credentials:

```bash
cp .env_example .env
```

2. Environment variables to set:

* `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
* `DATABASE_URL`
* `PGHOST`, `PGPASSWORD`
* `FLASK_ENV` (development or production)

> **Note:** Do not commit `.env` to version control.

---

## 5. Running the Project

Run all services using the unified shell script:

```bash
chmod +x run.sh
./run.sh
```

For faster subsequent runs (skips dependency installation and DB setup):

```bash
./run.sh --quick
```

**Services and ports:**

* Atlas backend: `http://localhost:5000`
* Document Processing API: `http://localhost:5001`
* DSS Engine: `http://localhost:8000`
* Claim Process Tracker: `http://localhost:8001`
* Frontend dashboard: `http://localhost:5173`
* PostgreSQL: `5432`

**Stopping all services:**
Press `Ctrl+C` — the script will gracefully terminate all running services.

---

## 6. Seeding the Database

To populate initial FRA data:

```bash
./backend/atlas/seed.sh
```

The Claim Process Tracker database is automatically seeded with sample FRA claims on first run. For manual reseeding:

```bash
python -m backend.claim_process.migrations
python -m backend.claim_process.mock_data
```
---

## 7. Testing

Run backend tests:

```bash
cd backend/dss
python run_tests.py
```

Other tests can be run per module using the corresponding test files in `backend/atlas/tests` or `backend/document/tests`.

---

## 8. Contribution Guidelines

See `CONTRIBUTING.md` for:

* Branching strategy
* Coding standards
* Commit message conventions

---

## 9. Documentation

* API contracts: `docs/api-contracts`
* Feature guides: `docs/feature-guides`
* Swagger/OpenAPI docs available for Atlas and DSS backend when running locally:

  * Atlas: `http://localhost:5000/docs`
  * DSS: `http://localhost:8000/docs`

---
