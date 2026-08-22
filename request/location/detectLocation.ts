// types
import { type CityDocument } from "@/common/types/documentation/presets/city";

export interface DetectLocationResponse {
  success: boolean;
  cityName?: string;
  city?: CityDocument;
  state?: string;
  pincode?: string;
  rawDetected?: string;
  error?: string;
}

export const detectLocationApi = async (coords?: {
  latitude: number;
  longitude: number;
}): Promise<DetectLocationResponse> => {
  try {
    const params = coords
      ? `?lat=${coords.latitude}&lon=${coords.longitude}`
      : "";
    const res = await fetch(`/api/frontend/location/detect${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to detect location",
    };
  }
};
