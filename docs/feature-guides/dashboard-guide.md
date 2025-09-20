# Feature Guide: Dashboard Shell

**Branch Name:** `feature/dashboard`

**Purpose:**
Build a unified dashboard to host the FRA Atlas, DSS engine, Document Management, Health Alerts, and Mobile PWA tabs. The dashboard will provide role-based access, embed modules, and serve as the main interface for forest officials.

---

## Deliverables

### 1. Dashboard Skeleton

* React + TypeScript project (can be integrated with existing frontend workspace or separate).
* Folder structure: `components`, `pages`, `services`, `styles`.
* README.md explaining project structure, run instructions, and tab descriptions.
* Use Tailwind CSS for styling.

### 2. Layout

* Sidebar with navigation to all tabs: Atlas, DSS, Documents, Health Alerts, Mobile.
* Topbar with user info and role display.
* Responsive layout for desktop and tablets.

### 3. Tab Integration

* **Atlas Tab:** Embed Atlas frontend as a component or iframe (use static/mock build if backend not ready).
* **Other Tabs:** Placeholders for DSS, Documents, Health Alerts, Mobile. Display mock widgets or messages like "Coming soon".

### 4. Role-based Access (Mock)

* Implement simple role-based UI: Admin vs Forest Officer.
* Show/hide tabs based on role.
* Authentication can be mocked for MVP.

### 5. Independent Assumptions

* Atlas tab can use the frontend build or static mock.
* Other tabs can remain as placeholders with dummy content.
* No backend integration required for DSS, Documents, or Health Alerts at this stage.

### 6. Success Criteria

* Dashboard runs independently in browser.
* Sidebar navigation and topbar display correctly.
* Atlas tab is functional (using mock or embedded frontend).
* Placeholder tabs clearly indicate future modules.
* Layout is responsive and ready for integration with backend and other modules.
