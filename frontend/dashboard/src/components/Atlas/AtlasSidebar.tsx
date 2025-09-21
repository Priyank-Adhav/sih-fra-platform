import React, { useState } from "react";

// Mock data for states and districts
const STATES = [
  { name: "Madhya Pradesh", districts: ["Bhopal", "Indore", "Jabalpur"] },
  { name: "Tripura", districts: ["Agartala", "Udaipur"] },
  { name: "Odisha", districts: ["Bhubaneswar", "Cuttack"] },
  { name: "Telangana", districts: ["Hyderabad", "Warangal"] },
];

const BASE_LAYERS = [
  { id: "osm", label: "OpenStreetMap" },
  { id: "satellite", label: "Satellite" },
];

const OVERLAYS = [
  { id: "claims", label: "FRA Claims" },
  { id: "forest", label: "Forest Cover" },
  { id: "water", label: "Water Bodies" },
];

export type ClaimDetails = {
  id: string;
  claimant?: string;
  type?: string;
  area?: number;
  status?: string;
  [key: string]: any;
};

type AtlasSidebarProps = {
  selectedClaim?: ClaimDetails | null;
  onLocationChange?: (state: string, district: string) => void;
  onLayerChange?: (base: string, overlays: string[]) => void;
};

export default function AtlasSidebar({
  selectedClaim,
  onLocationChange,
  onLayerChange,
}: AtlasSidebarProps) {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [baseLayer, setBaseLayer] = useState("osm");
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["claims"]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setDistrict("");
    if (onLocationChange) onLocationChange(e.target.value, "");
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    if (onLocationChange) onLocationChange(state, e.target.value);
  };
  const handleBaseLayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseLayer(e.target.value);
    if (onLayerChange) onLayerChange(e.target.value, activeOverlays);
  };
  const handleOverlayToggle = (id: string) => {
    const next = activeOverlays.includes(id)
      ? activeOverlays.filter((o) => o !== id)
      : [...activeOverlays, id];
    setActiveOverlays(next);
    if (onLayerChange) onLayerChange(baseLayer, next);
  };

  const districts = STATES.find((s) => s.name === state)?.districts || [];

  return (
    <aside className="w-72 bg-white border-r p-4 flex flex-col gap-4 h-full">
      <div>
        <label className="block text-xs font-semibold mb-1">State</label>
        <select
          className="w-full border rounded p-1 mb-2"
          value={state}
          onChange={handleStateChange}
        >
          <option value="">Select State</option>
          {STATES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <label className="block text-xs font-semibold mb-1">District</label>
        <select
          className="w-full border rounded p-1"
          value={district}
          onChange={handleDistrictChange}
          disabled={!state}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Base Layer</label>
        <div className="flex gap-2 mb-2">
          {BASE_LAYERS.map((l) => (
            <label key={l.id} className="flex items-center gap-1">
              <input
                type="radio"
                name="baseLayer"
                value={l.id}
                checked={baseLayer === l.id}
                onChange={handleBaseLayerChange}
              />
              {l.label}
            </label>
          ))}
        </div>
        <label className="block text-xs font-semibold mb-1">Overlays</label>
        <div className="flex flex-col gap-1">
          {OVERLAYS.map((o) => (
            <label key={o.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={activeOverlays.includes(o.id)}
                onChange={() => handleOverlayToggle(o.id)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <label className="block text-xs font-semibold mb-1">Claim Details</label>
        {selectedClaim ? (
          <div className="bg-gray-50 rounded p-2 text-sm">
            <div>
              <span className="font-semibold">ID:</span> {selectedClaim.id}
            </div>
            {selectedClaim.claimant && (
              <div>
                <span className="font-semibold">Claimant:</span> {selectedClaim.claimant}
              </div>
            )}
            {selectedClaim.type && (
              <div>
                <span className="font-semibold">Type:</span> {selectedClaim.type}
              </div>
            )}
            {selectedClaim.area && (
              <div>
                <span className="font-semibold">Area:</span> {selectedClaim.area} ha
              </div>
            )}
            {selectedClaim.status && (
              <div>
                <span className="font-semibold">Status:</span> {selectedClaim.status}
              </div>
            )}
            {/* Add more fields as needed */}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Select a polygon to view details.</div>
        )}
      </div>
    </aside>
  );
}
