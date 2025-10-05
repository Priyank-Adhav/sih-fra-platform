import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// Mock data for states and districts
const STATES = [
  {
    name: "Madhya Pradesh",
    districts: ["Bhopal", "Indore", "Jabalpur"],
    claims: 1247,
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Tripura",
    districts: ["Agartala", "Udaipur"],
    claims: 589,
    color: "from-green-500 to-green-600"
  },
  {
    name: "Odisha",
    districts: ["Bhubaneswar", "Cuttack"],
    claims: 892,
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Telangana",
    districts: ["Hyderabad", "Warangal", "Adilabad", "Karimnagar", "Nizamabad"],
    claims: 734,
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Maharashtra",
    districts: ["Mumbai", "Pune", "Nashik", "Aurangabad", "Yavatmal"],
    claims: 978,
    color: "from-yellow-500 to-yellow-600"
  },
];


const BASE_LAYERS = [
  { id: "osm", labelKey: "openstreetmap", icon: "🗺️", descriptionKey: "base_layer_osm_desc" },
  { id: "satellite", labelKey: "satellite", icon: "🛰️", descriptionKey: "base_layer_satellite_desc" },
  { id: "terrain", labelKey: "terrain", icon: "⛰️", descriptionKey: "base_layer_terrain_desc" },
  { id: "soil_moisture", labelKey: "soil_moisture", icon: "💧", descriptionKey: "base_layer_soil_desc" },
  { id: "forest_cover", labelKey: "forest_cover", icon: "🌳", descriptionKey: "base_layer_forest_desc" },
];


const OVERLAYS = [
  {
    id: "claims",
    labelKey: "fra_claims",
    icon: "📋",
    color: "bg-primary",
    descriptionKey: "overlay_claims_desc"
  },
  {
    id: "forest",
    labelKey: "forest_cover",
    icon: "🌳",
    color: "bg-success",
    descriptionKey: "overlay_forest_desc"
  },
  {
    id: "water",
    labelKey: "water_bodies",
    icon: "💧",
    color: "bg-info",
    descriptionKey: "overlay_water_desc"
  },
  {
    id: "infrastructure",
    labelKey: "infrastructure",
    icon: "🏗️",
    color: "bg-warning",
    descriptionKey: "overlay_infrastructure_desc"
  },
];

// Mock bounding box/centroid for states and districts
export interface DistrictFocus {
  bbox: number[];
  centroid: number[];
  claims: number;
}
export interface StateFocus {
  bbox: number[];
  centroid: number[];
  districts: { [district: string]: DistrictFocus };
}
export const LOCATION_FOCUS: { [state: string]: StateFocus } = {
  "Madhya Pradesh": {
    bbox: [74.0, 21.0, 82.0, 27.0],
    centroid: [23.5, 78.0],
    districts: {
      Bhopal: { bbox: [77.2, 23.1, 77.6, 23.4], centroid: [23.25, 77.4], claims: 456 },
      Indore: { bbox: [75.7, 22.4, 76.0, 22.8], centroid: [22.6, 75.85], claims: 392 },
      Jabalpur: { bbox: [79.8, 23.0, 80.1, 23.4], centroid: [23.2, 80.0], claims: 399 },
    },
  },
  Tripura: {
    bbox: [91.0, 22.0, 92.0, 24.5],
    centroid: [23.5, 91.5],
    districts: {
      Agartala: { bbox: [91.2, 23.7, 91.3, 23.9], centroid: [23.8, 91.25], claims: 312 },
      Udaipur: { bbox: [91.5, 23.3, 91.7, 23.6], centroid: [23.45, 91.6], claims: 277 },
    },
  },
  Maharashtra: {
    bbox: [72.5, 15.6, 80.9, 22.0],
    centroid: [19.5, 75.5],
    districts: {
      Mumbai: { bbox: [72.75, 18.85, 72.95, 19.25], centroid: [19.1, 72.85], claims: 845 },
      Pune: { bbox: [73.3, 17.9, 74.3, 19.4], centroid: [18.52, 73.86], claims: 672 },
      Nashik: { bbox: [73.4, 19.8, 74.6, 20.6], centroid: [20.0, 73.8], claims: 410 }, // Trimbak lies here
      Nagpur: { bbox: [78.8, 20.8, 79.5, 21.5], centroid: [21.15, 79.1], claims: 529 },
      Aurangabad: { bbox: [75.0, 19.3, 76.1, 20.2], centroid: [19.9, 75.3], claims: 388 },
      Solapur: { bbox: [74.3, 17.0, 76.0, 18.3], centroid: [17.68, 75.9], claims: 301 },
      Yavatmal: { bbox: [77.0, 19.4, 79.2, 20.8], centroid: [20.1, 78.3], claims: 295 },
    },
  },
  Odisha: {
    bbox: [81.5, 18.5, 87.5, 22.5],
    centroid: [20.5, 84.5],
    districts: {
      Bhubaneswar: { bbox: [85.7, 20.1, 85.9, 20.4], centroid: [20.25, 85.8], claims: 467 },
      Cuttack: { bbox: [85.7, 20.3, 86.1, 20.6], centroid: [20.45, 85.9], claims: 425 },
    },
  },
  Telangana: {
    bbox: [77.0, 15.8, 81.0, 19.9],
    centroid: [17.8, 79.0],
    districts: {
      Adilabad: { bbox: [78.5, 18.5, 79.5, 19.5], centroid: [19.0, 79.0], claims: 298 },
      Nirmal: { bbox: [78.0, 18.5, 78.8, 19.3], centroid: [18.9, 78.4], claims: 261 },
      Nizamabad: { bbox: [77.6, 18.0, 78.5, 18.8], centroid: [18.3, 78.1], claims: 307 },
      Karimnagar: { bbox: [78.5, 17.7, 79.5, 18.6], centroid: [18.1, 79.1], claims: 334 },
      Warangal: { bbox: [78.8, 17.4, 80.0, 18.3], centroid: [17.9, 79.6], claims: 412 },
      Hyderabad: { bbox: [78.3, 17.2, 78.6, 17.6], centroid: [17.4, 78.5], claims: 725 },
      Mahabubnagar: { bbox: [77.2, 16.1, 78.8, 17.5], centroid: [16.8, 78.0], claims: 355 },
      Khammam: { bbox: [79.1, 16.5, 80.4, 17.8], centroid: [17.2, 80.0], claims: 289 },
    },
  }
};

export type ClaimDetails = {
  id: string;
  claimant?: string;
  type?: string;
  area?: number;
  status?: string;
  village?: string;
  district?: string;
  submissionDate?: string;
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
  const [activeTab, setActiveTab] = useState<"navigation" | "layers" | "details">("navigation");

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(e.target.value);
    setDistrict("");
    if (onLocationChange) onLocationChange(e.target.value, "");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    if (onLocationChange) onLocationChange(state, e.target.value);
  };

  const handleBaseLayerChange = (layerId: string) => {
    setBaseLayer(layerId);
    if (onLayerChange) onLayerChange(layerId, activeOverlays);
  };

  const handleOverlayToggle = (id: string) => {
    const next = activeOverlays.includes(id)
      ? activeOverlays.filter((o) => o !== id)
      : [...activeOverlays, id];
    setActiveOverlays(next);
    if (onLayerChange) onLayerChange(baseLayer, next);
  };

  const districts = STATES.find((s) => s.name === state)?.districts || [];
  const selectedStateData = STATES.find(s => s.name === state);

  return (
    <aside className="w-96 bg-white border-r border-gray-200 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-forest-50 to-emerald-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.707A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.707zM17.707 5.293A1 1 0 0118 6v10a1 1 0 01-.293.707L14 14.586V3.414l3.707 1.879z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("atlas_controls")}</h2>
            <p className="text-gray-600 text-sm">{t("interactive_fra_mapping")}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg border border-gray-300 p-1 shadow-sm relative">
  {/* Sliding indicator */}
  <div
    className={`absolute top-1 bottom-1 bg-gradient-to-r from-forest-500 to-forest-600 rounded-md shadow-sm transition-all duration-200 ease-in-out ${
      activeTab === "navigation" 
        ? "left-1 right-2/3" 
        : activeTab === "layers" 
        ? "left-1/3 right-1/3" 
        : "left-2/3 right-1"
    }`}
  />
  
  <button
    onClick={() => setActiveTab("navigation")}
    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md relative z-10 transition-colors duration-200 ${
      activeTab === "navigation" 
        ? "text-white" 
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    {t("atlas_tabs.navigation")}
  </button>
  <button
    onClick={() => setActiveTab("layers")}
    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md relative z-10 transition-colors duration-200 ${
      activeTab === "layers" 
        ? "text-white" 
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    {t("atlas_tabs.layers")}
  </button>
  <button
    onClick={() => setActiveTab("details")}
    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md relative z-10 transition-colors duration-200 ${
      activeTab === "details" 
        ? "text-white" 
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    {t("atlas_tabs.details")}
  </button>
</div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6 border-b border-gray-200 bg-gradient-to-r from-forest-50 to-emerald-50">
        {activeTab === "navigation" && (
          <div className="space-y-6">
            {/* Location Selection */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("location")}</h3>
                  <p className="text-gray-600 text-sm">{t("navigate_to_regions")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("state")}
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("district")}
                  </label>
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm disabled:bg-gray-100"
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

              {/* State Stats */}
              {selectedStateData && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{selectedStateData.name}</div>
                      <div className="text-sm text-gray-600">{t("district_count", { count: districts.length })}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{selectedStateData.claims}</div>
                      <div className="text-xs text-gray-500">{t("total_claims")}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("quick_actions")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-white border border-gray-300 rounded-xl hover:border-forest-500 hover:bg-forest-50 transition-all duration-200 text-center">
                  <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-forest-600">📊</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{t("view_analytics")}</div>
                </button>
                <button className="p-3 bg-white border border-gray-300 rounded-xl hover:border-forest-500 hover:bg-forest-50 transition-all duration-200 text-center">
                  <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-forest-600">📋</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{t("generate_report")}</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "layers" && (
          <div className="space-y-6">
            {/* Base Layers */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("base_layer")}</h3>
                  <p className="text-gray-600 text-sm">{t("choose_map_style")}</p>
                </div>
              </div>

              <div className="space-y-3">
                {BASE_LAYERS.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => handleBaseLayerChange(layer.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${baseLayer === layer.id
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${baseLayer === layer.id ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                        <span className="text-lg">{layer.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{t(layer.labelKey)}</div>
                        <div className="text-sm text-gray-600">{t(layer.descriptionKey)}</div>
                      </div>
                      {baseLayer === layer.id && (
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Layers */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("overlays")}</h3>
                  <p className="text-gray-600 text-sm">{t("toggle_data_layers")}</p>
                </div>
              </div>

              <div className="space-y-3">
                {OVERLAYS.map((overlay) => (
                  <button
                    key={overlay.id}
                    onClick={() => handleOverlayToggle(overlay.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${activeOverlays.includes(overlay.id)
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeOverlays.includes(overlay.id) ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        <span className="text-lg">{overlay.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{t(overlay.labelKey)}</div>
                        <div className="text-sm text-gray-600">{t(overlay.descriptionKey)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${overlay.color}`}></div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${activeOverlays.includes(overlay.id)
                          ? 'bg-green-500 border-green-500'
                          : 'bg-white border-gray-300'
                          }`}>
                          {activeOverlays.includes(overlay.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Claim Details */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("claim_details")}</h3>
                  <p className="text-gray-600 text-sm">{t("selected_claim_info")}</p>
                </div>
              </div>

              {selectedClaim ? (
                <div className="space-y-6">
                  {/* Claim Header */}
                  <div className="bg-white rounded-xl border border-amber-100 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-500">{t("claim_id")}</div>
                        <div className="text-lg font-bold text-gray-900 font-mono">{selectedClaim.id}</div>
                      </div>
                      {onEditClaim && (
                        <button
                          onClick={() => onEditClaim(selectedClaim)}
                          className="bg-gradient-to-r from-forest-500 to-forest-600 text-white px-4 py-2 rounded-lg font-medium hover:from-forest-600 hover:to-forest-700 transition-all duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t("buttons.edit")}
                        </button>
                      )}
                    </div>

                    {selectedClaim.claimant && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{selectedClaim.claimant}</div>
                          <div className="text-sm text-gray-600">{t("claimant")}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Claim Details Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    {selectedClaim.type && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">{t("claim_type")}</div>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-center">
                          {selectedClaim.type}
                        </div>
                      </div>
                    )}

                    {selectedClaim.area && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">{t("area")}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-900">{selectedClaim.area}</div>
                            <div className="text-sm text-gray-600">{t("hectares")}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedClaim.status && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">{t("status")}</div>
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${selectedClaim.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : selectedClaim.status === "pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${selectedClaim.status === "approved"
                              ? "bg-emerald-500"
                              : selectedClaim.status === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                              }`}
                          ></div>
                          {t(`${selectedClaim.status}`)}
                        </div>
                      </div>
                    )}

                    {(selectedClaim.village || selectedClaim.district) && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500 mb-2">{t("location")}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedClaim.village}
                              {selectedClaim.district ? `, ${selectedClaim.district}` : ""}
                            </div>
                            <div className="text-sm text-gray-600">{t("village_district")}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ✅ Dynamic Additional Fields */}
                    {Object.entries(selectedClaim).map(([key, value]) => {
                      if (
                        ["id", "claimant", "type", "area", "status", "village", "district"].includes(key) ||
                        !value ||
                        typeof value === "object"
                      ) {
                        return null;
                      }

                      const formattedKey = key.replace(/([A-Z])/g, " $1").trim();
                      const label =
                        formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

                      return (
                        <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                          <div className="text-sm font-medium text-gray-500 mb-1">
                            {label}
                          </div>
                          <div className="text-base font-semibold text-gray-900 break-words">
                            {String(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>


                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-forest-200 text-forest-700 py-2.5 rounded-lg font-medium hover:bg-forest-50 hover:border-forest-300 transition-all duration-200 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t("view_on_map")}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-white border border-forest-200 text-forest-700 py-2.5 rounded-lg font-medium hover:bg-forest-50 hover:border-forest-300 transition-all duration-200 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t("generate_report")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">{t("select_polygon_to_view")}</p>
                  <p className="text-gray-400 text-sm mt-1">{t("click_polygon_instructions")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}