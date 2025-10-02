import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// Mock data for states and districts
const STATES = [
  { name: "Madhya Pradesh", districts: ["Bhopal", "Indore", "Jabalpur"] },
  { name: "Tripura", districts: ["Agartala", "Udaipur"] },
  { name: "Odisha", districts: ["Bhubaneswar", "Cuttack"] },
  { name: "Telangana", districts: ["Hyderabad", "Warangal"] },
];

const BASE_LAYERS = [
  { id: "osm", labelKey: "openstreetmap" },
  { id: "satellite", labelKey: "satellite" },
];

const OVERLAYS = [
  { id: "claims", labelKey: "fra_claims" },
  { id: "forest", labelKey: "forest_cover" },
  { id: "water", labelKey: "water_bodies" },
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
  const { t } = useTranslation();
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
          {t("atlas_controls")}
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
              {t("location")}
            </h3>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text text-xs font-medium">{t("state")}</span>
              </label>
              <select
                className="select select-bordered select-sm w-full focus:select-primary"
                value={state}
                onChange={handleStateChange}
              >
                <option value="">{t("select_state")}</option>
                {STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">{t("district")}</span>
              </label>
              <select
                className="select select-bordered select-sm w-full focus:select-primary"
                value={district}
                onChange={handleDistrictChange}
                disabled={!state}
              >
                <option value="">{t("select_district")}</option>
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
              {t("map_layers")}
            </h3>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text text-xs font-medium">{t("base_layer")}</span>
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
                    <span className="text-sm">{t(l.labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">{t("overlays")}</span>
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
                    <span className="text-sm">{t(o.labelKey)}</span>
                    <div className="ml-auto">
                      <div className={`w-3 h-3 rounded-full ${
                        o.id === 'claims' ? 'bg-primary' : 
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
              {t("claim_details")}
            </h3>
            {selectedClaim ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="card-title text-sm font-semibold mb-0">{t("claim_details")}</h3>
                  {onEditClaim && (
                    <button
                      onClick={() => onEditClaim(selectedClaim)}
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      {t("edit")}
                    </button>
                  )}
                </div>
                <div className="stats shadow-sm">
                  <div className="stat py-2 px-3">
                    <div className="stat-title text-xs">{t("id")}</div>
                    <div className="stat-value text-sm">{selectedClaim.id}</div>
                  </div>
                  {selectedClaim.claimant && (
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">{t("claimant")}</div>
                      <div className="stat-value text-sm">{selectedClaim.claimant}</div>
                    </div>
                  )}
                  {selectedClaim.type && (
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">{t("type")}</div>
                      <div className="stat-value text-sm">
                        <div className="badge badge-primary badge-sm">{selectedClaim.type}</div>
                      </div>
                    </div>
                  )}
                  {selectedClaim.area && (
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">{t("area")}</div>
                      <div className="stat-value text-sm">{selectedClaim.area} ha</div>
                    </div>
                  )}
                  {selectedClaim.status && (
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">{t("status")}</div>
                      <div className="stat-value text-sm">
                        <div className={`badge badge-sm ${
                          selectedClaim.status === 'approved' ? 'badge-success' :
                          selectedClaim.status === 'pending' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {t(selectedClaim.status)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <svg className="w-12 h-12 text-base-content/30 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-base-content/50 text-sm">{t("select_polygon_to_view")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}