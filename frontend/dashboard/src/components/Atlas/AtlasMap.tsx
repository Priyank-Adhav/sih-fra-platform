// src/components/Atlas/AtlasMap.tsx
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
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

export default function AtlasMap() {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonData | null>(null);
  const [baseLayer, setBaseLayer] = useState<string>("osm");
  const [activeOverlays, setActiveOverlays] = useState<string[]>(["claims"]);
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_BASE ?? "";
    atlasService
      .fetchPolygonsFromApi(base)
      .then((list) => setPolygons(list))
      .catch((err) => {
        console.warn("Fetching polygons from API failed, falling back to mock:", err);
        atlasService.fetchPolygonsMock().then((m) => setPolygons(m));
      });
  }, []);

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

    // create local object (optimistic UI)
    const newPoly: PolygonData = {
      id: `local-${Date.now()}`,
      coords: latlngs,
      type: "IFR", // pick default; ideally user chooses
      properties: { source: "editor" },
    };

    // Optimistically add to UI
    setPolygons((s) => [...s, newPoly]);

    // Attach id to layer so edits/deletes can find it
    if (layer && layer.options) layer.options._id = newPoly.id;

    // Try to persist to API; fallback to mock if API call fails
    try {
      const base = (import.meta as any).env?.VITE_API_BASE ?? "";
      const res = await atlasService.createPolygonToApi(newPoly, base);
      // If API responds with id, update local polygon id
      const returnedId = res?.id ?? (res?.feature?.id ?? null);
      if (returnedId) {
        setPolygons((s) => s.map((p) => (p.id === newPoly.id ? { ...p, id: returnedId } : p)));
        // update attached layer id (if layer still exists)
        if (layer && layer.options) layer.options._id = returnedId;
      }
    } catch (err) {
      console.warn("Create to API failed; saved only locally (mock).", err);
      // Optionally persist to local mock store as well
      await atlasService.createPolygonMock(newPoly);
    }
  };

  const onEdited = async (e: any) => {
    const layers = e.layers;
    const updated: PolygonData[] = [];
    layers.eachLayer((l: any) => {
      const id = l.options && l.options._id;
      const latlngs = l.getLatLngs()[0].map((p: any) => [p.lat, p.lng]);
      if (id) updated.push({ id, coords: latlngs, type: "IFR", properties: {} });
    });

    for (const u of updated) {
      setPolygons((s) => s.map((p) => (p.id === u.id ? u : p)));
      // For MVP: call mock update; you can implement an API update if available
      try {
        // TODO: implement API PUT /api/polygons/{id} if backend supports it
        await atlasService.updatePolygonMock(u);
      } catch (err) {
        console.warn("Update mock failed:", err);
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
        // TODO: call API DELETE /api/polygons/{id} if backend exposes it
        await atlasService.deletePolygonMock(id);
      } catch (err) {
        console.warn("Delete mock failed:", err);
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
      />
      <div ref={containerRef} className="flex-1 flex flex-col p-4">
        {/* Enhanced Map Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="badge badge-primary badge-lg">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Interactive Atlas
            </div>
            <div className="text-sm text-base-content/70">
              {polygons.length} claims loaded
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportPNG} 
              className="btn btn-outline btn-primary btn-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export PNG
            </button>
          </div>
        </div>
        
        {/* Enhanced Map Container */}
        <div className="card bg-base-100 shadow-lg border border-base-300 flex-1">
          <div className="card-body p-0 h-full">
            <MapContainer center={[21.02, 81.02]} zoom={12} className="h-full w-full rounded-b-box">
              <MapInitializer onReady={(m) => setMapInstance(m)} />
              {/* Base Layers */}
              {baseLayer === "osm" && (
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              )}
              {baseLayer === "satellite" && (
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
              )}
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
                  }}
                  edit={{
                    remove: true,
                  }}
                />
                {/* Claims overlay */}
                {activeOverlays.includes("claims") &&
                  polygons.map((p) => (
                    <Polygon
                      key={p.id}
                      positions={p.coords as LatLngExpression[]}
                      pathOptions={{
                        color: p.type === "IFR" || p.type === "forest" ? "#228B22" : "#2b6cb0",
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2,
                      }}
                      eventHandlers={{
                        click: () => setSelectedPolygon(p),
                      }}
                    />
                  ))}
                {/* Future overlays: forest, water, etc. */}
                {activeOverlays.includes("forest") && (
                  // Mock: draw a sample forest polygon (replace with real data)
                  <Polygon
                    positions={[[21.01, 81.01], [21.03, 81.01], [21.03, 81.03], [21.01, 81.03]] as LatLngExpression[]}
                    pathOptions={{ color: "#228B22", weight: 1, fillOpacity: 0.1 }}
                  />
                )}
                {activeOverlays.includes("water") && (
                  // Mock: draw a sample water body polygon (replace with real data)
                  <Polygon
                    positions={[[21.015, 81.015], [21.025, 81.015], [21.025, 81.025], [21.015, 81.025]] as LatLngExpression[]}
                    pathOptions={{ color: "#1E90FF", weight: 1, fillOpacity: 0.15 }}
                  />
                )}
              </FeatureGroup>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
