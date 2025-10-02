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

// Mock bounding box/centroid for states and districts (for map focus)
export interface DistrictFocus {
  bbox: number[];
  centroid: number[];
}
export interface StateFocus {
  bbox: number[];
  centroid: number[];
  districts: { [district: string]: DistrictFocus };
}
export const LOCATION_FOCUS: { [state: string]: StateFocus } = {
  "Madhya Pradesh": {
    bbox: [74.0, 21.0, 82.0, 27.0], // [west, south, east, north]
    centroid: [23.5, 78.0],
    districts: {
      Bhopal: { bbox: [77.2, 23.1, 77.6, 23.4], centroid: [23.25, 77.4] },
      Indore: { bbox: [75.7, 22.4, 76.0, 22.8], centroid: [22.6, 75.85] },
      Jabalpur: { bbox: [79.8, 23.0, 80.1, 23.4], centroid: [23.2, 80.0] },
    },
  },
  Tripura: {
    bbox: [91.0, 22.0, 92.0, 24.5],
    centroid: [23.5, 91.5],
    districts: {
      Agartala: { bbox: [91.2, 23.7, 91.3, 23.9], centroid: [23.8, 91.25] },
      Udaipur: { bbox: [91.5, 23.3, 91.7, 23.6], centroid: [23.45, 91.6] },
    },
  },
  Odisha: {
    bbox: [81.5, 18.5, 87.5, 22.5],
    centroid: [20.5, 84.5],
    districts: {
      Bhubaneswar: { bbox: [85.7, 20.1, 85.9, 20.4], centroid: [20.25, 85.8] },
      Cuttack: { bbox: [85.7, 20.3, 86.1, 20.6], centroid: [20.45, 85.9] },
    },
  },
  Telangana: {
    bbox: [77.0, 15.5, 81.0, 19.5],
    centroid: [17.5, 79.0],
    districts: {
      Hyderabad: { bbox: [78.3, 17.2, 78.6, 17.6], centroid: [17.4, 78.45] },
      Warangal: { bbox: [79.4, 17.8, 79.7, 18.2], centroid: [18.0, 79.55] },
    },
  },
};

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
  onEditClaim?: (claim: ClaimDetails) => void;
};

export default function AtlasSidebar({
  selectedClaim,
  onLocationChange,
  onLayerChange,
  onEditClaim,
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
    <aside className="w-80 bg-base-100 border-r border-base-300 shadow-lg flex flex-col h-full">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Atlas Controls
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Location Selection */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Location
            </h3>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text text-xs font-medium">State</span>
              </label>
              <select
                className="select select-bordered select-sm w-full focus:select-primary"
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
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">District</span>
              </label>
              <select
                className="select select-bordered select-sm w-full focus:select-primary"
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
          </div>
        </div>

        {/* Map Layers */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Map Layers
            </h3>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text text-xs font-medium">Base Layer</span>
              </label>
              <div className="flex flex-col gap-2">
                {BASE_LAYERS.map((l) => (
                  <label key={l.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-300 p-2 rounded">
                    <input
                      type="radio"
                      name="baseLayer"
                      value={l.id}
                      checked={baseLayer === l.id}
                      onChange={handleBaseLayerChange}
                      className="radio radio-primary radio-sm"
                    />
                    <span className="text-sm">{l.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">Overlays</span>
              </label>
              <div className="flex flex-col gap-2">
                {OVERLAYS.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-300 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={activeOverlays.includes(o.id)}
                      onChange={() => handleOverlayToggle(o.id)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span className="text-sm">{o.label}</span>
                    <div className="ml-auto">
                      <div className={`w-3 h-3 rounded-full ${o.id === 'claims' ? 'bg-primary' :
                          o.id === 'forest' ? 'bg-success' :
                            'bg-info'
                        }`}></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Claim Details */}
        <div className="card bg-base-200 shadow-sm flex-1">
          <div className="card-body p-4">
            <h3 className="card-title text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Claim Details
            </h3>
            {selectedClaim ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="card-title text-sm font-semibold mb-0 text-base-content/80">Claim Information</h3>
                  {onEditClaim && (
                    <button
                      onClick={() => onEditClaim(selectedClaim)}
                      className="btn btn-sm btn-outline btn-primary gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                </div>

                {/* Vertical Table with Enhanced Styling */}
                <div className="space-y-3 bg-base-100 rounded-lg border border-base-300 p-4">
                  {/* ID Row */}
                  <div className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                        Claim ID
                      </label>
                      <div className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded inline-block">
                        {selectedClaim.id}
                      </div>
                    </div>
                  </div>

                  {/* Claimant Row */}
                  {selectedClaim.claimant && (
                    <div className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                          Claimant
                        </label>
                        <div className="text-sm font-medium text-base-content flex items-center gap-2">
                          <svg className="w-4 h-4 text-base-content/40" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {selectedClaim.claimant}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type Row */}
                  {selectedClaim.type && (
                    <div className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                          Claim Type
                        </label>
                        <div className="text-sm">
                          <div className="badge badge-primary badge-lg font-semibold px-3 py-8">
                            {selectedClaim.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Area Row */}
                  {selectedClaim.area && (
                    <div className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                          Area
                        </label>
                        <div className="text-sm font-medium text-base-content flex items-center gap-2">
                          <svg className="w-4 h-4 text-base-content/40" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          <span className="font-bold text-base-content">{selectedClaim.area}</span>
                          <span className="text-base-content/60">hectares</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Row */}
                  {selectedClaim.status && (
                    <div className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                          Status
                        </label>
                        <div className="text-sm">
                          <div className={`badge badge-lg font-semibold px-3 py-2 capitalize ${selectedClaim.status === 'approved' ? 'badge-success text-success-content' :
                              selectedClaim.status === 'pending' ? 'badge-warning text-warning-content' :
                                'badge-error text-error-content'
                            }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${selectedClaim.status === 'approved' ? 'bg-success-content' :
                                selectedClaim.status === 'pending' ? 'bg-warning-content' :
                                  'bg-error-content'
                              }`}></div>
                            {selectedClaim.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Fields - Dynamic */}
                  {Object.entries(selectedClaim).map(([key, value]) => {
                    // Skip already displayed fields and null/undefined values
                    if (['id', 'claimant', 'type', 'area', 'status'].includes(key) ||
                      !value ||
                      typeof value === 'object') {
                      return null;
                    }

                    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
                    const formattedLabel = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

                    return (
                      <div key={key} className="flex items-start gap-3 py-2 border-b border-base-200 last:border-b-0">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wide block mb-1">
                            {formattedLabel}
                          </label>
                          <div className="text-sm font-medium text-base-content">
                            {String(value)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="btn btn-sm btn-outline btn-accent flex-1 gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View on Map
                  </button>
                  <button className="btn btn-sm btn-outline btn-info gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                <div className="relative mb-3">
                  <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-base-content/50 text-sm font-medium">Select a claim on the map</p>
                <p className="text-base-content/30 text-xs mt-1">to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
