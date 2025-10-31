// utils/stateDetection.ts

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export interface GeolocationResult {
  state: string | null;
  error?: string;
}

function normalizeStateName(name: string): string {
  return name.replace(/NCT of /gi, '').trim();
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'MGNREGA-Dashboard (student-project)' }
    });

    const data = await response.json();
    const rawState = data.address?.state || data.address?.state_district;

    if (!rawState) return null;

    const normalized = normalizeStateName(rawState);

    if (INDIAN_STATES.includes(normalized)) return normalized;

    console.warn("State not matched, detected:", rawState);
    return null;
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return null;
  }
}

export async function detectUserState(): Promise<GeolocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { state: null, error: "Geolocation not supported in environment" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const state = await reverseGeocode(coords.latitude, coords.longitude);
        state ? resolve({ state }) : resolve({ state: null, error: "Unable to detect state" });
      },
      (err) => {
        console.error("Location denied:", err);
        resolve({ state: null, error: "Permission denied / Location blocked" });
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}
