// src/components/Atlas/AtlasMap.tsx
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
function VectorTileLayer({
  polygons,
  onPolygonClick,
  activeOverlays,
  selectedPolygonId
}: {
  polygons: PolygonData[];
  onPolygonClick: (polygon: PolygonData) => void;
  activeOverlays: string[];
  selectedPolygonId: string | null;
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

    // Create style function
    const getStyle = (feature: any) => {
      const type = feature?.properties?.type || 'default';

      switch (type) {
        case "IFR":
        case "forest":
        case "Community Forest Lands":
          return {
            color: "#228B22",
            fillColor: "#228B22",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
            fill: true
          };
        case "CFR":
          return {
            color: "#2b6cb0",
            fillColor: "#2b6cb0",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
            fill: true
          };
        default:
          return {
            color: "#6B7280",
            fillColor: "#6B7280",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.3,
            fill: true
          };
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
          layer.setStyle({
            weight: 4,
            opacity: 1,
            fillOpacity: 0.5
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

              // Highlight the clicked feature
              e.target.setStyle({
                weight: 4,
                opacity: 1,
                fillOpacity: 0.5
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
                fillOpacity: 0.4
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
  }, [map, polygons, onPolygonClick, activeOverlays, selectedPolygonId]);

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
        console.log("Loading polygons with base URL:", base);

        const list = await atlasService.fetchPolygonsFromApi(base);
        console.log("Successfully loaded polygons from API:", list.length);
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
    <div className="flex h-full bg-base-100">
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
      <div ref={containerRef} className="flex-1 flex flex-col p-4">
        {/* Enhanced Map Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {t('atlas_panel.interactive_atlas')}
            </div>
            <div className="text-sm text-base-content/70">
              {loading ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                t('atlas_panel.claims_loaded', { count: polygons.length })
              )}
            </div>
            {error && (
              <div className="badge badge-warning badge-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            {isDrawingMode && (
              <div className="badge badge-warning badge-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                {t('atlas_panel.controls.drawing_mode')}
              </div>
            )}
            {isEditMode && (
              <div className="badge badge-info badge-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {t('atlas_panel.controls.edit_mode')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDrawingMode}
              className={`btn btn-sm ${isDrawingMode ? 'btn-primary' : 'btn-outline btn-primary'}`}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {isDrawingMode ? t('atlas_panel.controls.exit_drawing') : t('atlas_panel.controls.draw_claim')}
            </button>
            <button
              onClick={toggleEditMode}
              className={`btn btn-sm ${isEditMode ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
              disabled={loading || polygons.length === 0}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {isEditMode ? t('atlas_panel.controls.exit_edit') : t('atlas_panel.controls.edit_claims')}
            </button>
            <button
              onClick={handleExportPNG}
              className="btn btn-outline btn-primary btn-sm"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {t('atlas_panel.controls.export_png')}
            </button>
          </div>
        </div>

        {/* Enhanced Map Container */}
        <div className="card bg-base-100 shadow-lg border border-base-300 flex-1">
          <div className="card-body p-0 h-full">
            {loading && (
              <div className="absolute inset-0 bg-base-100/80 z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="text-sm text-base-content/70">{t('atlas_panel.loading_polygons')}</p>
                </div>
              </div>
            )}
            <MapContainer center={[21.02, 81.02]} zoom={12} className="h-full w-full rounded-b-box" preferCanvas={true}>
              <MapInitializer onReady={(m) => setMapInstance(m)} />
              {/* Base Layers */}
              {baseLayer === "osm" && (
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              )}
              {baseLayer === "satellite" && (
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              )}

              <VectorTileLayer
                polygons={polygons}
                onPolygonClick={(polygon) => {
                  console.log('Polygon clicked:', polygon); // Debug log
                  setSelectedPolygon(polygon);
                  if (isEditMode) {
                    handleEditClaim(polygon);
                  }
                }}
                activeOverlays={activeOverlays}
                selectedPolygonId={selectedPolygon?.id || null}
              />

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
