export type GeoResult = {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
};

export type CurrentWeather = {
  temperatureC: number;
  windSpeedKmh: number;
  weatherCode: number;
  uvIndex?: number;
  time?: string;
  timezone?: string;
};

export type DailyForecast = {
  date: string;
  tMinC: number;
  tMaxC: number;
  weatherCode: number;
  sunrise?: string;
  sunset?: string;
  precipitationProbability?: number;
  windSpeedMaxKmh?: number;
  uvIndexMax?: number;
};

export function formatLocationLabel(place: GeoResult): string {
  const parts = [place.name];
  if (place.admin1) parts.push(place.admin1);
  parts.push(place.country);
  return parts.filter(Boolean).join(", ");
}

export function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] ?? `Code ${code}`;
}

export type WeatherMood = "good" | "neutral" | "bad";

export function evaluateMood(code: number): WeatherMood {
  if ([0, 1, 2].includes(code)) return "good";
  if ([3, 45, 48].includes(code)) return "neutral";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(
      code
    )
  )
    return "bad";
  return "neutral";
}


