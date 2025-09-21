// src/services/atlasService.ts
import type { LatLngExpression } from "leaflet";

/**
 * atlasService
 * - converts between GeoJSON (API contract) and frontend-friendly PolygonData ([lat,lng])
 * - provides API methods (fetch/create) and mock/localStorage fallbacks
 */

/** Public PolygonData used by the frontend (Leaflet: [lat, lng]) */
export type PolygonData = {
  id: string;
  coords: LatLngExpression[]; // array of [lat, lng]
  type: string; // claimType like 'IFR', 'CFR' or 'forest', etc.
  properties?: Record<string, any>;
};

/* ---------------------------
   LocalStorage-based Mock Store
   --------------------------- */
const STORAGE_KEY = "fwd_mock_polygons";

function readStore(): PolygonData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample: PolygonData[] = [
        {
          id: "sample-1",
          coords: [
            [21.0, 81.0],
            [21.05, 81.0],
            [21.05, 81.05],
            [21.0, 81.05],
          ],
          type: "forest",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw) as PolygonData[];
  } catch {
    return [];
  }
}

function writeStore(list: PolygonData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* Mock API-like functions (local fallback) */
export async function fetchPolygonsMock(): Promise<PolygonData[]> {
  return new Promise((res) => setTimeout(() => res(readStore()), 250));
}

export async function createPolygonMock(p: PolygonData): Promise<PolygonData> {
  const cur = readStore();
  cur.push(p);
  writeStore(cur);
  return new Promise((res) => setTimeout(() => res(p), 200));
}

export async function updatePolygonMock(p: PolygonData): Promise<PolygonData> {
  const cur = readStore();
  const idx = cur.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    cur[idx] = p;
    writeStore(cur);
  }
  return new Promise((res) => setTimeout(() => res(p), 200));
}

export async function deletePolygonMock(id: string): Promise<void> {
  const cur = readStore().filter((x) => x.id !== id);
  writeStore(cur);
  return new Promise((res) => setTimeout(() => res(), 150));
}

/* ---------------------------
   GeoJSON <> PolygonData helpers
   --------------------------- */

/**
 * Convert a GeoJSON Feature (Polygon) -> PolygonData (Leaflet-friendly)
 * GeoJSON coordinates are [lng, lat] and must be flipped to [lat, lng]
 */
export function featureToPolygonData(feature: any): PolygonData | null {
  if (!feature || !feature.geometry) return null;
  const geom = feature.geometry;
  if (geom.type === "Polygon") {
    const ring = geom.coordinates[0] as number[][];
    const coords: LatLngExpression[] = ring.map(([lng, lat]) => [lat, lng]);
    const id = feature.id ?? feature.properties?.id ?? `feat-${Date.now()}`;
    return {
      id,
      coords,
      type: feature.properties?.claimType ?? feature.properties?.type ?? "unknown",
      properties: feature.properties ?? {},
    };
  }

  // Optionally handle MultiPolygon -> flatten to multiple PolygonData items (not implemented)
  return null;
}

/**
 * Convert PolygonData -> GeoJSON Feature
 * Leaflet [lat, lng] -> GeoJSON [lng, lat]
 */
export function polygonDataToFeature(p: PolygonData): any {
  const ring = (p.coords as number[][]).map(([lat, lng]) => [lng, lat]);
  return {
    type: "Feature",
    id: p.id,
    properties: { ...(p.properties ?? {}), claimType: p.type },
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

/* ---------------------------
   API-aware methods
   --------------------------- */

/**
 * Helper: default base URL (from Vite env) or passed value
 */
function getBaseUrl(baseUrl?: string) {
  // prefer explicit param, else use VITE_API_BASE if present, else empty
  if (baseUrl && baseUrl.length) return baseUrl.replace(/\/+$/, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envBase = (import.meta as any).env?.VITE_API_BASE;
  return (envBase ?? "").replace(/\/+$/, "");
}

/**
 * Fetch polygons from backend API (expects GeoJSON FeatureCollection)
 * Falls back to rejecting if network fails (caller may fallback to mock)
 */
export async function fetchPolygonsFromApi(baseUrl?: string): Promise<PolygonData[]> {
  const base = getBaseUrl(baseUrl);
  //const url = `${base}/api/polygons`;
  const url = `${base}/polygons`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch polygons: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const features = data?.features ?? [];
  const out: PolygonData[] = [];
  for (const f of features) {
    const p = featureToPolygonData(f);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Create a polygon on the API. Sends a GeoJSON Feature in body.
 * Returns parsed API response (expected { message, id } or full feature).
 */
export async function createPolygonToApi(p: PolygonData, baseUrl?: string): Promise<any> {
  const base = getBaseUrl(baseUrl);
  const url = `${base}/api/polygons`;
  const feature = polygonDataToFeature(p);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(feature),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Create polygon failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

/* Expose both API and mock functions so caller can choose or fallback */
export const atlasService = {
  // Mocks
  fetchPolygonsMock,
  createPolygonMock,
  updatePolygonMock,
  deletePolygonMock,
  // API
  fetchPolygonsFromApi,
  createPolygonToApi,
  // Helpers
  featureToPolygonData,
  polygonDataToFeature,
};

export default atlasService;
