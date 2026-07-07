import type { DeliveryAddress } from "./address";

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

const DEFAULT_BIAS = {
  lat: 41.7151,
  lng: 44.8271,
};

export function getGoogleMapsApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  return key?.trim() || null;
}

function getComponent(
  components: Array<{ long_name: string; types: string[] }>,
  ...types: string[]
): string {
  for (const type of types) {
    const match = components.find((component) => component.types.includes(type));
    if (match?.long_name) return match.long_name;
  }
  return "";
}

function mapPlaceDetailsToAddress(details: {
  formatted_address?: string;
  address_components?: Array<{ long_name: string; types: string[] }>;
  geometry?: { location?: { lat: number; lng: number } };
}): DeliveryAddress | null {
  const lat = details.geometry?.location?.lat;
  const lng = details.geometry?.location?.lng;
  if (lat == null || lng == null) return null;

  const components = details.address_components ?? [];
  const route = getComponent(components, "route");
  const streetNumber = getComponent(components, "street_number");
  const street =
    [route, streetNumber].filter(Boolean).join(" ").trim() ||
    details.formatted_address?.split(",")[0]?.trim() ||
    "";

  return {
    street,
    city:
      getComponent(
        components,
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1",
      ) || "საქართველო",
    district:
      getComponent(components, "sublocality", "sublocality_level_1", "neighborhood") ||
      undefined,
    postalCode: getComponent(components, "postal_code") || undefined,
    coordinates: { lat, lng },
  };
}

export async function fetchPlaceSuggestions(
  input: string,
  sessionToken?: string,
): Promise<PlaceSuggestion[]> {
  const key = getGoogleMapsApiKey();
  const query = input.trim();
  if (!key || query.length < 2) return [];

  const params = new URLSearchParams({
    input: query,
    key,
    language: "ka",
    components: "country:ge",
    location: `${DEFAULT_BIAS.lat},${DEFAULT_BIAS.lng}`,
    radius: "50000",
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  const response = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);
  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn("Google Places autocomplete:", data.status, data.error_message);
    return [];
  }

  return (data.predictions ?? []).map(
    (prediction: {
      place_id: string;
      description: string;
      structured_formatting?: {
        main_text?: string;
        secondary_text?: string;
      };
    }) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || "",
    }),
  );
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken?: string,
): Promise<DeliveryAddress | null> {
  const key = getGoogleMapsApiKey();
  if (!key || !placeId) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key,
    language: "ka",
    fields: "address_components,formatted_address,geometry",
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  const response = await fetch(`${DETAILS_URL}?${params.toString()}`);
  const data = await response.json();

  if (data.status !== "OK" || !data.result) {
    console.warn("Google Places details:", data.status, data.error_message);
    return null;
  }

  return mapPlaceDetailsToAddress(data.result);
}
