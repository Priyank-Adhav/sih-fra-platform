import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import atlasService from "../../services/atlasService";
import type { PolygonData } from "../../services/atlasService";
import html2canvas from "html2canvas";
import AtlasSidebar from "./AtlasSidebar";
import type { ClaimDetails } from "./AtlasSidebar";
import { LOCATION_FOCUS } from "./AtlasSidebar";
import ClaimForm, { type ClaimFormData } from "./ClaimForm";
import { useTranslation } from "react-i18next";

/* react-leaflet-draw has weak/absent types — silence TS for the import */
// @ts-ignore
import { EditControl } from "react-leaflet-draw";

/**
 * MapInitializer - get typed map instance via useMap()
 */
function MapInitializer({ onReady }: { onReady: (m: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    onReady(map);
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map, onReady]);
  return null;
}

/**
 * VectorTileLayer - Component to render polygons as vector tiles
 */
/**
 * VectorTileLayer - Component to render polygons as vector tiles
 */
function VectorTileLayer({
  polygons,
  onPolygonClick,
  activeOverlays,
  selectedPolygonId,
  baseLayer // Add baseLayer prop
}: {
  polygons: PolygonData[];
  onPolygonClick: (polygon: PolygonData) => void;
  activeOverlays: string[];
  selectedPolygonId: string | null;
  baseLayer: string; // Add baseLayer prop
}) {
  const map = useMap();
  const vectorGridRef = useRef<any>(null);
  const geojsonLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !activeOverlays.includes("claims") || polygons.length === 0) {
      // Remove existing layers if conditions not met
      if (vectorGridRef.current) {
        map.removeLayer(vectorGridRef.current);
        vectorGridRef.current = null;
      }
      if (geojsonLayerRef.current) {
        map.removeLayer(geojsonLayerRef.current);
        geojsonLayerRef.current = null;
      }
      return;
    }

    // Use regular GeoJSON layer instead of VectorGrid to avoid compatibility issues
    const L = (window as any).L;

    // Convert polygons to GeoJSON
    const geojsonData = {
      type: 'FeatureCollection',
      features: polygons.map(p => ({
        type: 'Feature',
        id: p.id,
        properties: {
          id: p.id,
          type: p.type,
          ...p.properties
        },
        geometry: {
          type: 'Polygon',
          coordinates: [p.coords.map(coord => {
            const [lat, lng] = coord as [number, number];
            return [lng, lat]; // GeoJSON uses [lng, lat]
          })]
        }
      }))
    };

    // Remove existing layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    // Create style function based on base layer
    const getStyle = (feature: any) => {
      const type = feature?.properties?.type || 'default';

      // Different color schemes for different base layers
      switch (baseLayer) {
        case "soil_moisture":
          // Brown/orange color scheme for soil moisture layer
          switch (type) {
            case "IFR":
            case "forest":
            case "Community Forest Lands":
              return {
                color: "#D2691E", // Chocolate brown
                fillColor: "#D2691E",
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.4,
                fill: true
              };
            case "CFR":
              return {
                color: "#8B4513", // Saddle brown
                fillColor: "#8B4513",
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.4,
                fill: true
              };
            default:
              return {
                color: "#A0522D", // Sienna
                fillColor: "#A0522D",
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.4,
                fill: true
              };
          }

        case "forest_cover":
          // Blue/purple color scheme for forest cover layer
          switch (type) {
            case "IFR":
            case "forest":
            case "Community Forest Lands":
              return {
                color: "#1E40AF", // Royal blue
                fillColor: "#1E40AF",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
            case "CFR":
              return {
                color: "#6B21A8", // Purple
                fillColor: "#6B21A8",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
            default:
              return {
                color: "#3730A3", // Indigo
                fillColor: "#3730A3",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
          }

        default:
          // Original green color scheme for all other layers
          switch (type) {
            case "IFR":
            case "forest":
            case "Community Forest Lands":
              return {
                color: "#228B22", // Forest green
                fillColor: "#228B22",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
            case "CFR":
              return {
                color: "#2b6cb0", // Blue
                fillColor: "#2b6cb0",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
            default:
              return {
                color: "#6B7280", // Gray
                fillColor: "#6B7280",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.3,
                fill: true
              };
          }
      }
    };

    // Create GeoJSON layer with proper event handling
    const geojsonLayer = L.geoJSON(geojsonData, {
      style: getStyle,
      onEachFeature: (feature: any, layer: any) => {
        // Store the original polygon data on the layer for easy access
        layer._polygonData = polygons.find(p => p.id === feature.id);

        // Check if this is the selected polygon and apply selected style
        if (feature.id === selectedPolygonId) {
          // Enhanced selection style that works with all color schemes
          layer.setStyle({
            weight: 4,
            opacity: 1,
            fillOpacity: 0.6,
            color: "#FFD700", // Gold border for selected polygon
            fillColor: layer.options.fillColor // Keep original fill color
          });
          layer.bringToFront();
        }

        layer.on({
          click: (e: any) => {
            const polygonData = e.target._polygonData;
            if (polygonData) {
              onPolygonClick(polygonData);

              // Highlight the clicked polygon
              if (geojsonLayerRef.current) {
                geojsonLayerRef.current.eachLayer((l: any) => {
                  l.setStyle(getStyle(l.feature));
                });
              }

              // Highlight the clicked feature with gold border
              e.target.setStyle({
                weight: 4,
                opacity: 1,
                fillOpacity: 0.6,
                color: "#FFD700", // Gold border
                fillColor: e.target.options.fillColor // Keep original fill
              });

              // Bring to front
              e.target.bringToFront();
            }
          },
          mouseover: (e: any) => {
            // Only highlight if not the selected polygon
            if (e.target._polygonData?.id !== selectedPolygonId) {
              e.target.setStyle({
                weight: 3,
                opacity: 1,
                fillOpacity: 0.5,
                color: e.target.options.color, // Keep original color
                fillColor: e.target.options.fillColor // Keep original fill
              });
              e.target.bringToFront();
            }
          },
          mouseout: (e: any) => {
            // Don't reset style if this is the selected polygon
            if (e.target._polygonData?.id !== selectedPolygonId) {
              e.target.setStyle(getStyle(e.target.feature));
            }
          }
        });
      }
    });

    geojsonLayer.addTo(map);
    geojsonLayerRef.current = geojsonLayer;

    return () => {
      if (geojsonLayerRef.current && map) {
        map.removeLayer(geojsonLayerRef.current);
        geojsonLayerRef.current = null;
      }
    };
  }, [map, polygons, onPolygonClick, activeOverlays, selectedPolygonId, baseLayer]); // Add baseLayer to dependencies

  return null;
}



export default function AtlasMap() {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonData | null>(null);
  const [baseLayer, setBaseLayer] = useState<string>("osm");
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["claims"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing and editing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<PolygonData | null>(null);
  const [editingPolygon, setEditingPolygon] = useState<PolygonData | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const loadPolygons = async () => {
      setLoading(true);
      setError(null);

      try {
        const base = (import.meta as any).env?.VITE_API_BASE ?? "";

        const list = await atlasService.fetchPolygonsFromApi(base);
        setPolygons(list);
      } catch (err) {
        console.warn("Fetching polygons from API failed, falling back to mock:", err);
        setError(t('atlas_panel.errors.api_failed'));
        try {
          const mockList = await atlasService.fetchPolygonsMock();
          setPolygons(mockList);
        } catch (mockErr) {
          console.error("Mock data also failed:", mockErr);
          setError(t('atlas_panel.errors.load_failed'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadPolygons();
  }, [t]);

  useEffect(() => {
    if (!mapInstance) return;
    const t = setTimeout(() => mapInstance.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [mapInstance]);

  /** Handlers for draw events from react-leaflet-draw */
  const onCreated = async (e: any) => {
    const layer = e.layer;
    // layer.getLatLngs() -> nested arrays. We assume single ring polygons
    const latlngs: LatLngExpression[] = layer.getLatLngs()[0].map((p: any) => [p.lat, p.lng]);

    // Calculate area (rough approximation)
    const area = calculatePolygonArea(latlngs);

    // create local object for new claim
    const newPoly: PolygonData = {
      id: `temp-${Date.now()}`,
      coords: latlngs,
      type: "IFR", // default type
      properties: {
        source: "editor",
        area: area,
        status: "pending"
      },
    };

    // Store the pending polygon and show form
    setPendingPolygon(newPoly);
    setShowClaimForm(true);

    // Remove the temporary polygon from map until form is submitted
    if (fgRef.current) {
      fgRef.current.removeLayer(layer);
    }
  };

  const onEdited = async (e: any) => {
    const layers = e.layers;
    const updated: PolygonData[] = [];
    layers.eachLayer((l: any) => {
      const id = l.options && l.options._id;
      const latlngs = l.getLatLngs()[0].map((p: any) => [p.lat, p.lng]);
      if (id) {
        const existingPolygon = polygons.find(p => p.id === id);
        if (existingPolygon) {
          const area = calculatePolygonArea(latlngs);
          updated.push({
            ...existingPolygon,
            coords: latlngs,
            properties: {
              ...existingPolygon.properties,
              area,
              source: "editor"
            }
          });
        }
      }
    });

    for (const u of updated) {
      setPolygons((s) => s.map((p) => (p.id === u.id ? u : p)));
      try {
        const base = (import.meta as any).env?.VITE_API_BASE ?? "";
        await atlasService.updatePolygonToApi(u, base);
        console.log("Successfully updated polygon via API:", u.id);
      } catch (err) {
        console.warn("Update API failed, trying mock:", err);
        try {
          await atlasService.updatePolygonMock(u);
        } catch (mockErr) {
          console.warn("Update mock also failed:", mockErr);
        }
      }
    }
  };

  const onDeleted = async (e: any) => {
    const layers = e.layers;
    const removedIds: string[] = [];
    layers.eachLayer((l: any) => {
      const id = l.options && l.options._id;
      if (id) removedIds.push(id);
    });

    for (const id of removedIds) {
      setPolygons((s) => s.filter((p) => p.id !== id));
      try {
        const base = (import.meta as any).env?.VITE_API_BASE ?? "";
        await atlasService.deletePolygonFromApi(id, base);
        console.log("Successfully deleted polygon via API:", id);
      } catch (err) {
        console.warn("Delete API failed, trying mock:", err);
        try {
          await atlasService.deletePolygonMock(id);
        } catch (mockErr) {
          console.warn("Delete mock also failed:", mockErr);
        }
      }
    }
  };

  const handleExportPNG = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const data = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = data;
    a.download = "atlas_snapshot.png";
    a.click();
  };

  // Calculate polygon area using the shoelace formula (rough approximation)
  const calculatePolygonArea = (coords: LatLngExpression[]): number => {
    if (coords.length < 3) return 0;

    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lat1 = (coords[i] as [number, number])[0];
      const lng1 = (coords[i] as [number, number])[1];
      const lat2 = (coords[j] as [number, number])[0];
      const lng2 = (coords[j] as [number, number])[1];

      area += lng1 * lat2 - lng2 * lat1;
    }

    // Convert to hectares (rough approximation)
    return Math.abs(area) * 111000 * 111000 / 10000 / 2;
  };

  // Handle drawing mode toggle
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    setIsEditMode(false);
    setSelectedPolygon(null);
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setIsDrawingMode(false);
  };

  // Handle claim form submission
  const handleClaimFormSubmit = async (formData: ClaimFormData) => {
    console.log('Claim form submitted:', formData);
    if (!pendingPolygon) return;

    // Create the final polygon with form data
    const finalPolygon: PolygonData = {
      ...pendingPolygon,
      id: `claim-${Date.now()}`,
      type: formData.type,
      properties: {
        ...pendingPolygon.properties,
        claimant: formData.claimant,
        claimantId: formData.claimantId,
        area: formData.area,
        village: formData.village,
        block: formData.block,
        district: formData.district,
        state: formData.state,
        status: formData.status,
        submissionDate: formData.submissionDate,
        description: formData.description,
        contactNumber: formData.contactNumber,
        email: formData.email,
        source: "user_created"
      }
    };

    // Add to polygons list immediately for responsive UI
    setPolygons(prev => [...prev, finalPolygon]);

    // Try to save to API
    try {
      const base = (import.meta as any).env?.VITE_API_BASE ?? "";
      const res = await atlasService.createPolygonToApi(finalPolygon, base);
      const returnedId = res?.id ?? (res?.feature?.id ?? null);
      if (returnedId) {
        // Update with the server-assigned ID
        setPolygons(prev => prev.map(p => p.id === finalPolygon.id ? { ...p, id: returnedId.toString() } : p));
      }
      console.log("Successfully created polygon via API:", returnedId);
    } catch (err) {
      console.warn("Create to API failed; saving locally.", err);
      try {
        await atlasService.createPolygonMock(finalPolygon);
      } catch (mockErr) {
        console.error("Mock create also failed:", mockErr);
        // Remove from UI if both API and mock failed
        setPolygons(prev => prev.filter(p => p.id !== finalPolygon.id));
        alert(t('atlas_panel.errors.save_failed'));
        return;
      }
    }

    // Reset state
    setPendingPolygon(null);
    setShowClaimForm(false);
    setIsDrawingMode(false);
  };

  // Handle edit claim
  const handleEditClaim = (polygon: PolygonData) => {
    setEditingPolygon(polygon);
    setShowClaimForm(true);
  };

  // Handle claim form update
  const handleClaimFormUpdate = async (formData: ClaimFormData) => {
    if (!editingPolygon) return;

    const updatedPolygon: PolygonData = {
      ...editingPolygon,
      type: formData.type,
      properties: {
        ...editingPolygon.properties,
        claimant: formData.claimant,
        claimantId: formData.claimantId,
        area: formData.area,
        village: formData.village,
        block: formData.block,
        district: formData.district,
        state: formData.state,
        status: formData.status,
        submissionDate: formData.submissionDate,
        description: formData.description,
        contactNumber: formData.contactNumber,
        email: formData.email,
      }
    };

    // Update polygons list immediately
    setPolygons(prev => prev.map(p => p.id === editingPolygon.id ? updatedPolygon : p));

    // Try to save to API
    try {
      const base = (import.meta as any).env?.VITE_API_BASE ?? "";
      await atlasService.updatePolygonToApi(updatedPolygon, base);
      console.log("Successfully updated polygon via API:", updatedPolygon.id);
    } catch (err) {
      console.warn("Update API failed, trying mock:", err);
      try {
        await atlasService.updatePolygonMock(updatedPolygon);
      } catch (mockErr) {
        console.warn("Update mock also failed:", mockErr);
        // Revert the UI change if both failed
        setPolygons(prev => prev.map(p => p.id === editingPolygon.id ? editingPolygon : p));
        alert(t('atlas_panel.errors.update_failed'));
        return;
      }
    }

    // Reset state
    setEditingPolygon(null);
    setShowClaimForm(false);
  };

  // Handler for sidebar location change
  const handleLocationChange = (state: string, district: string) => {
    if (!mapInstance) return;
    // Try to focus on district if selected, else state
    if (state && district && LOCATION_FOCUS[state]?.districts?.[district]) {
      const { bbox, centroid } = LOCATION_FOCUS[state].districts[district];
      // Fit bounds if bbox, else set view to centroid
      if (bbox) {
        mapInstance.fitBounds([
          [bbox[1], bbox[0]] as [number, number], // SW (lat, lng)
          [bbox[3], bbox[2]] as [number, number], // NE (lat, lng)
        ]);
      } else if (centroid) {
        mapInstance.setView(centroid as [number, number], 12);
      }
    } else if (state && LOCATION_FOCUS[state]) {
      const { bbox, centroid } = LOCATION_FOCUS[state];
      if (bbox) {
        mapInstance.fitBounds([
          [bbox[1], bbox[0]] as [number, number],
          [bbox[3], bbox[2]] as [number, number],
        ]);
      } else if (centroid) {
        mapInstance.setView(centroid as [number, number], 7);
      }
    }
  };

  // Handler for sidebar layer change
  const handleLayerChange = (base: string, overlays: string[]) => {
    setBaseLayer(base);
    setActiveOverlays(overlays);
  };

  // Convert PolygonData to ClaimDetails for sidebar
  const getClaimDetails = (poly: PolygonData | null): ClaimDetails | null => {
    if (!poly) return null;
    return {
      id: poly.id,
      claimant: poly.properties?.claimant,
      type: poly.type,
      area: poly.properties?.area,
      status: poly.properties?.status,
      ...poly.properties,
    };
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-green-50 to-green-100">
      <AtlasSidebar
        selectedClaim={getClaimDetails(selectedPolygon)}
        onLocationChange={handleLocationChange}
        onLayerChange={handleLayerChange}
        onEditClaim={(claim) => {
          const polygon = polygons.find(p => p.id === claim.id);
          if (polygon) {
            handleEditClaim(polygon);
          }
        }}
      />

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-forest-600 to-forest-700 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.707A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.707zM17.707 5.293A1 1 0 0118 6v10a1 1 0 01-.293.707L14 14.586V3.414l3.707 1.879z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("interactive_atlas")}</h1>
                <p className="text-gray-600 text-lg">{t("fra_claims_mapping_analysis")}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>{t("claims_loaded", { count: polygons.length })}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{t("ministry_tribal_affairs")}</span>
                </div>
              </div>
            </div>
            {/* Enhanced API Status */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-300 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {t("api_connected")}
                </span>
                <button
                  onClick={() => { }}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  title={t("check_api_status")}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Enhanced Map Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-forest-600 to-forest-700 rounded-lg px-4 py-3 text-white flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" />
                  <path d="M2 12h20" strokeLinecap="round" strokeDasharray="2 2" className="opacity-60" />
                  <path d="M12 2v20" strokeLinecap="round" strokeDasharray="2 2" className="opacity-60" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-80" />
                  <path d="M16 8l2-2-2-2" strokeLinecap="round" className="opacity-70" />
                  <path d="M8 16l-2 2 2 2" strokeLinecap="round" className="opacity-70" />
                </svg>
                <span className="font-medium">{t('atlas_panel.interactive_atlas')}</span>
              </div>

              {loading && (
                <div className="badge badge-warning badge-lg px-4 py-6">
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  {t('atlas_panel.loading_polygons')}
                </div>
              )}

              {isDrawingMode && (
                <div className="badge badge-warning badge-lg px-4 py-6">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {t('atlas_panel.controls.drawing_mode')}
                </div>
              )}

              {isEditMode && (
                <div className="badge badge-info badge-lg px-4 py-6">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  {t('atlas_panel.controls.edit_mode')}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDrawingMode}
              className={`btn px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-3 ${isDrawingMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-amber-500 hover:text-amber-700'
                }`}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {isDrawingMode ? t('atlas_panel.controls.exit_drawing') : t('atlas_panel.controls.draw_claim')}
            </button>

            <button
              onClick={toggleEditMode}
              className={`btn px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-3 ${isEditMode
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-700'
                }`}
              disabled={loading || polygons.length === 0}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {isEditMode ? t('atlas_panel.controls.exit_edit') : t('atlas_panel.controls.edit_claims')}
            </button>

            <button
              onClick={handleExportPNG}
              className="btn bg-gradient-to-r from-forest-500 to-forest-600 text-white px-6 py-3 font-semibold hover:from-forest-600 hover:to-forest-700 transition-all duration-200 flex items-center gap-3 shadow-lg"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {t('atlas_panel.controls.export_png')}
            </button>
          </div>
        </div>

        {/* Enhanced Map Container */}
        <div ref={containerRef} className="card bg-white shadow-2xl border border-gray-200 rounded-2xl flex-1 overflow-hidden">
          <div className="card-body p-0 h-full relative">
            {loading && (
              <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-forest-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{t('atlas_panel.loading_polygons')}</p>
                    <p className="text-gray-600 text-sm mt-2">Loading FRA claims data...</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute top-4 left-4 right-4 z-40">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-900">Data Loading Issue</p>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <MapContainer
              center={[22.5937, 78.9629]}
              zoom={7}
              className="h-full w-full"
              preferCanvas={true}
              zoomControl={true}
              attributionControl={true}
            >
              <MapInitializer onReady={(m) => setMapInstance(m)} />

              {/* Base Layers */}
              {baseLayer === "osm" && (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              )}
              {baseLayer === "satellite" && (
                <>
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  />
                </>

              )}
              {baseLayer === "terrain" && (
                <TileLayer
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
                />
              )}
              {baseLayer === "soil_moisture" && (
                <>
                  <TileLayer
                    url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L4_Analyzed_Root_Zone_Soil_Moisture/default/2025-09-28/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png"
                    maxZoom={6}
                    tileSize={256}
                  />
                  {/* Legend overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(255, 255, 255, 0.8)",
                      padding: "5px",
                      borderRadius: "5px",
                      zIndex: 1000
                    }}
                  >
                    <img
                      src="https://gibs.earthdata.nasa.gov/legends/SMAP_Analyzed_Soil_Moisture_H.svg"
                      alt="Soil Moisture Legend"
                      style={{ width: "500px" }}
                    />
                  </div>
                </>
              )}
              {baseLayer === "forest_cover" && (
                <>
                  <TileLayer
                    url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2025-10-03/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png"
                    attribution='NASA GIBS - MODIS NDVI'
                    maxZoom={9}
                  />
                  <div className="legend"
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(255, 255, 255, 0.8)",
                      padding: "5px",
                      borderRadius: "5px",
                      zIndex: 1000
                    }}>
                    <img src="https://gibs.earthdata.nasa.gov/legends/MODIS_NDVI_H.svg" alt="Forest Cover Legend" style={{ width: "500px" }} />
                  </div>
                </>
              )}



              {/* Vector Layers */}
              {/* Vector Layers */}
              <VectorTileLayer
                polygons={polygons}
                onPolygonClick={(polygon) => {
                  console.log('Polygon clicked:', polygon);
                  setSelectedPolygon(polygon);
                  if (isEditMode) {
                    handleEditClaim(polygon);
                  }
                }}
                activeOverlays={activeOverlays}
                selectedPolygonId={selectedPolygon?.id || null}
                baseLayer={baseLayer} // Add this prop
              />

              {/* Drawing and Editing Controls */}
              <FeatureGroup ref={fgRef}>
                <EditControl
                  position="topright"
                  onCreated={onCreated}
                  onEdited={onEdited}
                  onDeleted={onDeleted}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: isDrawingMode,
                  }}
                  edit={isEditMode ? {
                    remove: true,
                    edit: {},
                  } : undefined}
                />
              </FeatureGroup>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Claim Form Modal */}
      <ClaimForm
        isOpen={showClaimForm}
        onClose={() => {
          setShowClaimForm(false);
          setPendingPolygon(null);
          setEditingPolygon(null);
        }}
        onSubmit={editingPolygon ? handleClaimFormUpdate : handleClaimFormSubmit}
        initialData={editingPolygon ? {
          claimant: editingPolygon.properties?.claimant || "",
          claimantId: editingPolygon.properties?.claimantId || "",
          type: editingPolygon.type as any,
          area: editingPolygon.properties?.area || 0,
          village: editingPolygon.properties?.village || "",
          block: editingPolygon.properties?.block || "",
          district: editingPolygon.properties?.district || "",
          state: editingPolygon.properties?.state || "",
          status: editingPolygon.properties?.status as any || "pending",
          submissionDate: editingPolygon.properties?.submissionDate || new Date().toISOString().split('T')[0],
          description: editingPolygon.properties?.description || "",
          contactNumber: editingPolygon.properties?.contactNumber || "",
          email: editingPolygon.properties?.email || "",
        } : undefined}
        mode={editingPolygon ? "edit" : "create"}
      />
    </div>
  );
}