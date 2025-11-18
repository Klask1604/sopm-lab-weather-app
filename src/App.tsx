import { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
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
        "temperature_2m,weather_code,wind_speed_10m"
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
