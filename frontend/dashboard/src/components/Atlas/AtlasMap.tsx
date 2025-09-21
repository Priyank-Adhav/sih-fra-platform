// src/components/Atlas/AtlasMap.tsx
import React, { useEffect, useRef, useState } from "react";
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

  return (
    <div ref={containerRef} className="h-[calc(100vh-64px)] rounded shadow overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={handleExportPNG} className="px-3 py-1 bg-white rounded border">
          Export PNG
        </button>
      </div>

      <MapContainer center={[21.02, 81.02]} zoom={12} className="h-full w-full">
        <MapInitializer onReady={(m) => setMapInstance(m)} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

          {polygons.map((p) => (
            <Polygon
              key={p.id}
              positions={p.coords as LatLngExpression[]}
              pathOptions={{
                color: p.type === "IFR" || p.type === "forest" ? "#1f7a1f" : "#2b6cb0",
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.2,
              }}
            />
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
