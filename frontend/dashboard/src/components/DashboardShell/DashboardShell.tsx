import React, { Suspense, useState } from "react";
import Sidebar from "./Sidebar";

// lazy load "panels" (Atlas is the heavy one)
const Atlas = React.lazy(() => import("../Atlas/AtlasMap"));
const DSS = React.lazy(() => import("../DSS/DSSPanel"));
const Documents = React.lazy(() => import("../Doc-Management/DocManagementPanel.tsx"));

export default function DashboardShell() {
  const [active, setActive] = useState<"atlas" | "dss" | "docs">("atlas");

  const getActiveModuleName = () => {
    switch (active) {
      case "atlas":
        return "Atlas";
      case "dss":
        return "DSS";
      case "docs":
        return "Documents";
      default:
        return "Module";
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Enhanced Navigation Bar */}
      <nav className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">FRA Atlas Dashboard</h1>
              <p className="text-xs text-base-content/70">Forest Rights Act Monitoring System</p>
            </div>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <div className="breadcrumbs text-sm">
            <ul>
              <li><span className="text-base-content/70">Dashboard</span></li>
              <li><span className="text-primary font-medium">{getActiveModuleName()}</span></li>
            </ul>
          </div>
        </div>
        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <div className="badge badge-success badge-sm">Online</div>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-sm font-semibold">A</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li><a>Profile</a></li>
                <li><a>Settings</a></li>
                <li><a>Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar active={active} setActive={setActive} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={
            <div className="flex justify-center items-center h-full bg-base-100">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                <p className="text-base-content/70">Loading {getActiveModuleName()}...</p>
              </div>
            </div>
          }>
            {active === "atlas" && <Atlas />}
            {active === "dss" && <DSS />}
            {active === "docs" && <Documents />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}