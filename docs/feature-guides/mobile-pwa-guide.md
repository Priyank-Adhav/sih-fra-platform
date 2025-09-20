# Feature Guide: Mobile PWA

**Branch Name:** `feature/mobile-pwa`

**Purpose:**
Build an offline-first mobile Progressive Web App (PWA) for claim verification and Gram Sabha workflows. Focus on frontend functionality, offline data storage, and mock sync with backend. Backend API integration will be handled later.

---

## Deliverables

### 1. PWA Scaffold

* React + TypeScript project, optionally using Capacitor or Ionic for mobile wrappers.
* Folder structure: `components`, `pages`, `services`, `styles`.
* README.md explaining project structure and running instructions.
* Service worker setup for offline capabilities.

### 2. Offline Data Storage

* IndexedDB or local SQLite for offline form storage.
* Forms for claim/patta/village input.
* Ability to save drafts offline and view stored entries.

### 3. Sync Simulation

* Mock sync function to backend endpoints (can use static JSON responses).
* Status indicators for synced vs unsynced entries.

### 4. Map View (Optional)

* Placeholder map view to show village or claim location.
* Can use static GeoJSON or mock data.

### 5. Independent Assumptions

* No backend required for MVP; mock API calls and static data suffice.
* Focus on offline form functionality and local storage.
* Map can be simplified or static.

### 6. Success Criteria

* PWA runs independently in browser or mobile device.
* Offline form entry and storage works.
* Mock sync simulates sending data to backend.
* Map view displays mock polygons correctly.
* Ready for integration with backend, dashboard, and Atlas frontend later.
