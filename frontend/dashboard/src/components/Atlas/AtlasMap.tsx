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
import * as atlasService from "../../services/atlasService";
import type { PolygonData } from "../../services/atlasService";
import html2canvas from "html2canvas";

/* react-leaflet-draw doesn't yet have official types; silence TS for the import */
// @ts-ignore
import { EditControl } from "react-leaflet-draw";

/**
 * MapInitializer: a small component that runs inside MapContainer and exposes
 * the Leaflet map instance via the onReady callback.
 */
function MapInitializer({ onReady }: { onReady: (m: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    onReady(map);
    // force a redraw after a short delay (helps with layout transitions)
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
    atlasService.fetchPolygons().then((list) => setPolygons(list));
  }, []);

  // Draw handlers
  const onCreated = async (e: any) => {
    const layer = e.layer;
    // leaflet lat/lng objects -> [lat, lng]
    const latlngs: LatLngExpression[] = layer
      .getLatLngs()[0]
      .map((p: any) => [p.lat, p.lng]);
    const newPoly: PolygonData = await atlasService.createPolygon({
      id: `p-${Date.now()}`,
      coords: latlngs,
      type: "forest",
    });

    // Optionally attach the id to the layer so later edits/deletes can find it
    if (layer && layer.options) {
      layer.options._id = newPoly.id;
    }

    setPolygons((s) => [...s, newPoly]);
  };

  const onEdited = async (e: any) => {
    const layers = e.layers;
    const updated: PolygonData[] = [];
    layers.eachLayer((l: any) => {
      const id = l.options && l.options._id;
      const latlngs = l.getLatLngs()[0].map((p: any) => [p.lat, p.lng]);
      if (id) updated.push({ id, coords: latlngs, type: "forest" });
    });
    for (const u of updated) {
      await atlasService.updatePolygon(u);
      setPolygons((s) => s.map((p) => (p.id === u.id ? u : p)));
    }
  };

  const onDeleted = async (e: any) => {
    const layers = e.layers;
    const removed: string[] = [];
    layers.eachLayer((l: any) => {
      const id = l.options && l.options._id;
      if (id) removed.push(id);
    });
    for (const id of removed) {
      await atlasService.deletePolygon(id);
      setPolygons((s) => s.filter((p) => p.id !== id));
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

      <MapContainer
        center={[21.02, 81.02]}
        zoom={12}
        className="h-full w-full"
      >
        {/* initialize map instance via MapInitializer */}
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
                color: p.type === "forest" ? "#1f7a1f" : "#2b6cb0",
                weight: 2,
                opacity: 0.7,
                fillOpacity: 0.2,
              }}
            />
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
