import React, { Suspense, useState } from "react";
import Sidebar from "./Sidebar";

// lazy load "panels" (Atlas is the heavy one)
const Atlas = React.lazy(() => import("../Atlas/AtlasMap"));
const DSS = React.lazy(() => import("../DSS/DSSPanel"));

export default function DashboardShell() {
  const [active, setActive] = useState<"atlas" | "dss">("atlas");

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 bg-white shadow flex items-center px-4">
        <h1 className="text-lg font-semibold">FRA Dashboard</h1>
      </header>

      <div className="flex flex-1">
        <Sidebar active={active} setActive={setActive} />
        <main className="flex-1 bg-gray-50 p-4 overflow-hidden">
          <Suspense fallback={<div>Loading module…</div>}>
            {active === "atlas" && <Atlas />}
            {active === "dss" && <DSS />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
