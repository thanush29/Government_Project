// utils/districtDetection.ts

export interface GeolocationResult {
  district: string | null;
  error?: string;
}

function normalizeDistrictName(name: string): string {
  return name
    .replace(/District|district|, India| India/g, "")
    .trim()
    .toUpperCase();
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "MGNREGA-Dashboard (student-project)" },
    });

    const data = await response.json();
    const addr = data.address || {};

    // Priority: district → state_district → county → fallback null
    const rawDistrict =
      addr.district ||
      addr.state_district ||
      addr.county ||
      null;

    if (!rawDistrict) return null;

    const normalized = normalizeDistrictName(rawDistrict);

    if (!normalized) return null;
    return normalized;
  } catch (err) {
    console.error("Reverse geocode error:", err);
    return null;
  }
}

export async function detectUserDistrict(): Promise<GeolocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { district: null, error: "Geolocation not supported in environment" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const district = await reverseGeocode(coords.latitude, coords.longitude);
        district
          ? resolve({ district })
          : resolve({ district: null, error: "Unable to detect district" });
      },
      (err) => {
        console.error("Location denied:", err);
        resolve({ district: null, error: "Permission denied / Location blocked" });
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  });
}
