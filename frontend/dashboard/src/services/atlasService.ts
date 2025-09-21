import type { LatLngExpression } from "leaflet";

/**
 * Simple in-memory/mock service to simulate CRUD.
 * Replace with actual API calls to FastAPI later.
 */

export type PolygonData = {
  id: string;
  coords: LatLngExpression[]; // [lat, lng] tuples
  type: "forest" | "water" | "agriculture" | "settlement" | string;
};

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
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeStore(list: PolygonData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function fetchPolygons(): Promise<PolygonData[]> {
  // simulate network delay
  return new Promise((res) => setTimeout(() => res(readStore()), 300));
}

export async function createPolygon(p: PolygonData): Promise<PolygonData> {
  const cur = readStore();
  cur.push(p);
  writeStore(cur);
  return new Promise((res) => setTimeout(() => res(p), 200));
}

export async function updatePolygon(p: PolygonData): Promise<PolygonData> {
  const cur = readStore();
  const idx = cur.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    cur[idx] = p;
    writeStore(cur);
  }
  return new Promise((res) => setTimeout(() => res(p), 200));
}

export async function deletePolygon(id: string): Promise<void> {
  const cur = readStore().filter((x) => x.id !== id);
  writeStore(cur);
  return new Promise((res) => setTimeout(() => res(), 150));
}
