import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";
import SearchBar from "./components/SearchBar";
import ResultsList from "./components/ResultsList";
import CurrentWeatherCard from "./components/CurrentWeatherCard";
import ForecastGrid from "./components/ForecastGrid";
import SelectedDayDetails from "./components/SelectedDayDetails";
import type {
  CurrentWeather,
  DailyForecast,
  GeoResult,
  WeatherMood,
} from "./types";
import { evaluateMood, formatLocationLabel } from "./types";

function makeTheme(mood: WeatherMood) {
  const primary = "#646cff";
  const surfaces = {
    good: "rgba(255,255,255,0.06)",
    neutral: "rgba(255,255,255,0.05)",
    bad: "rgba(255,255,255,0.04)",
  }[mood];
  return createTheme({
    palette: {
      mode: "dark",
      primary: { main: primary },
      background: {
        default: "#0a0a0a",
        paper: surfaces,
      },
    },
    typography: {
      fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    },
    transitions: {
      duration: {
        standard: 600,
      },
    },
  });
}

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<GeoResult | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const mood: WeatherMood = useMemo(
    () => (current ? evaluateMood(current.weatherCode) : "neutral"),
    [current]
  );
  const theme = useMemo(() => makeTheme(mood), [mood]);

  useEffect(() => {
    if (!selected) return;
    void fetchWeather(selected.latitude, selected.longitude);
  }, [selected]);

  async function fetchGeocoding(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.searchParams.set("name", q);
      url.searchParams.set("count", "5");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      const list: GeoResult[] =
        (data?.results ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          country: r.country,
          latitude: r.latitude,
          longitude: r.longitude,
          admin1: r.admin1,
        })) ?? [];
      setResults(list);
    } catch (e: any) {
      setSearchError(e?.message ?? "Search error");
    } finally {
      setIsSearching(false);
    }
  }

  async function fetchWeather(lat: number, lon: number) {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lon));
      url.searchParams.set(
        "current",
        "temperature_2m,weather_code,wind_speed_10m,uv_index"
      );
      url.searchParams.set(
        "daily",
        [
          "temperature_2m_max",
          "temperature_2m_min",
          "weather_code",
          "sunrise",
          "sunset",
          "precipitation_probability_max",
          "wind_speed_10m_max",
          "uv_index_max",
        ].join(",")
      );
      url.searchParams.set("timezone", "auto");
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Weather failed: ${res.status}`);
      const data = await res.json();
      const cur: CurrentWeather = {
        temperatureC:
          Math.round((data?.current?.temperature_2m ?? 0) * 10) / 10,
        windSpeedKmh:
          Math.round((data?.current?.wind_speed_10m ?? 0) * 10) / 10,
        weatherCode: data?.current?.weather_code ?? 0,
        uvIndex: data?.current?.uv_index ?? undefined,
        time: data?.current?.time ?? undefined,
        timezone: data?.timezone ?? undefined,
      };
      const days: DailyForecast[] = (data?.daily?.time ?? []).map(
        (t: string, idx: number) => ({
          date: t,
          tMinC:
            Math.round((data?.daily?.temperature_2m_min?.[idx] ?? 0) * 10) / 10,
          tMaxC:
            Math.round((data?.daily?.temperature_2m_max?.[idx] ?? 0) * 10) / 10,
          weatherCode: data?.daily?.weather_code?.[idx] ?? 0,
          sunrise: data?.daily?.sunrise?.[idx],
          sunset: data?.daily?.sunset?.[idx],
          precipitationProbability:
            data?.daily?.precipitation_probability_max?.[idx],
          windSpeedMaxKmh: data?.daily?.wind_speed_10m_max?.[idx],
          uvIndexMax: data?.daily?.uv_index_max?.[idx],
        })
      );
      setCurrent(cur);
      setForecast(days.slice(0, 5));
      setSelectedDay(null);
    } catch (e: any) {
      setWeatherError(e?.message ?? "Failed to load weather");
      setCurrent(null);
      setForecast([]);
    } finally {
      setIsLoadingWeather(false);
    }
  }

  function handleSelect(place: GeoResult) {
    setSelected(place);
    setResults([]);
    setQuery(formatLocationLabel(place));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void fetchGeocoding(query);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported");
      return;
    }
    setWeatherError(null);
    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setSelected({
          id: -1,
          name: "My Location",
          country: "",
          latitude: lat,
          longitude: lon,
        });
        await fetchWeather(lat, lon);
      },
      (err) => {
        setIsLoadingWeather(false);
        setWeatherError(err.message ?? "Failed to get location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const headerSubtitle = useMemo(() => {
    if (selected) return formatLocationLabel(selected);
    return "Search for a city or use your current location";
  }, [selected]);

  // Generate weather alert notification
  const weatherAlert = useMemo(() => {
    if (!current) return null;

    const temp = current.temperatureC;
    const code = current.weatherCode;

    // Snow codes: 71, 73, 75, 77, 85, 86
    // Thunderstorm codes: 95, 96, 99
    // Rain codes: 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82
    const hasSnow = [71, 73, 75, 77, 85, 86].includes(code);
    const hasThunder = [95, 96, 99].includes(code);
    const hasRain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
    const hasFog = [45, 48].includes(code);
    const isCold = temp < 10;
    const isHot = temp > 30;
    const isClear = [0, 1, 2].includes(code);
    const isCloudyOnly = [3].includes(code); // Just overcast

    if (hasThunder) {
      return {
        severity: "warning" as const,
        title: "⚡ Thunderstorm Alert",
        message: `Thunderstorms expected. Stay safe indoors if possible.`,
      };
    }

    if (hasSnow) {
      return {
        severity: "warning" as const,
        title: "❄️ Snow Warning",
        message: `Snow or sleet expected. Dress warmly and be careful on roads.`,
      };
    }

    if (isCold) {
      return {
        severity: "error" as const,
        title: "🥶 Cold Alert",
        message: `Temperature is below 10°C (${temp}°C). Dress warmly!`,
      };
    }

    if (isHot) {
      return {
        severity: "error" as const,
        title: "🔥 Heat Alert",
        message: `Temperature is above 30°C (${temp}°C). Stay hydrated!`,
      };
    }

    if (isClear) {
      return {
        severity: "success" as const,
        title: "☀️ Perfect Weather",
        message: `Beautiful ${temp}°C. Perfect time to enjoy the outdoors!`,
      };
    }

    if (hasRain) {
      return {
        severity: "info" as const,
        title: "🌧️ Rainy Day",
        message: `Rain expected. Bring an umbrella!`,
      };
    }

    if (hasFog) {
      return {
        severity: "info" as const,
        title: "🌫️ Fog Warning",
        message: `Fog present. Drive safely with caution.`,
      };
    }

    if (isCloudyOnly) {
      return {
        severity: "info" as const,
        title: "☁️ Cloudy",
        message: `Overcast conditions. ${temp}°C.`,
      };
    }

    // Default fallback
    return {
      severity: "info" as const,
      title: "🌤️ Weather Update",
      message: `Current temperature: ${temp}°C.`,
    };
  }, [current]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={`app-container mood-${mood}`}>
        <Container maxWidth="md" className="app-content">
          <Box className="app-header">
            <Typography variant="h3" component="h1" className="app-title">
              Weather
            </Typography>
            <Typography variant="body1" className="app-subtitle">
              {headerSubtitle}
            </Typography>
          </Box>

          <Box className="search-section">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              isSearching={isSearching}
              onSubmit={handleSubmit}
              onUseMyLocation={useMyLocation}
            />
            {searchError && (
              <Alert severity="error" className="glass-alert" sx={{ mt: 2 }}>
                {searchError}
              </Alert>
            )}
            <ResultsList
              results={results}
              onSelect={handleSelect}
              formatLabel={formatLocationLabel}
            />
          </Box>

          <Box className="weather-section">
            {isLoadingWeather && (
              <Box className="loading-container">
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading weather…</Typography>
              </Box>
            )}
            {weatherError && (
              <Alert severity="error" className="glass-alert">
                {weatherError}
              </Alert>
            )}

            {weatherAlert && !isLoadingWeather && !weatherError && (
              <Alert severity={weatherAlert.severity} className="glass-alert" sx={{ mb: 2 }}>
                <AlertTitle>{weatherAlert.title}</AlertTitle>
                {weatherAlert.message}
              </Alert>
            )}

            {current && !isLoadingWeather && !weatherError && (
              <CurrentWeatherCard current={current} selected={selected} />
            )}

            {forecast.length > 0 && !isLoadingWeather && !weatherError && (
              <>
                <ForecastGrid
                  forecast={forecast}
                  selectedDate={selectedDay?.date ?? null}
                  onSelectDay={(day) =>
                    setSelectedDay((prev) =>
                      prev?.date === day.date ? null : day
                    )
                  }
                />
                <SelectedDayDetails selectedDay={selectedDay} />
              </>
            )}
          </Box>

          <Box className="app-footer">
            <Typography variant="caption" color="text.secondary">
              Data by{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "inherit" }}
              >
                Open-Meteo
              </a>
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
