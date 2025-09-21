import React from "react";

export default function Sidebar({
  active,
  setActive,
}: {
  active: "atlas" | "dss";
  setActive: (a: "atlas" | "dss") => void;
}) {
  return (
    <aside className="w-56 bg-white border-r p-4">
      <button
        onClick={() => setActive("atlas")}
        className={`w-full py-2 mb-2 text-left rounded ${active === "atlas" ? "bg-blue-50" : ""}`}
      >
        Atlas
      </button>
      <button
        onClick={() => setActive("dss")}
        className={`w-full py-2 mb-2 text-left rounded ${active === "dss" ? "bg-blue-50" : ""}`}
      >
        DSS
      </button>
      {/* add more module buttons here */}
    </aside>
  );
}
