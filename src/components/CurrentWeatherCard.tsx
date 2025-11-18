import {
  Card,
  CardContent,
  Chip,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Air as AirIcon,
  LocationOn as LocationOnIcon,
  WbSunny as WbSunnyIcon,
} from "@mui/icons-material";
import type { CurrentWeather, GeoResult } from "../types";
import { formatLocationLabel, weatherCodeToText } from "../types";
import type { JSX } from "react";

type Props = {
  current: CurrentWeather | null;
  selected: GeoResult | null;
};

export default function CurrentWeatherCard({ current, selected }: Props) {
  if (!current) return null;
  const formattedTime = (() => {
    const t = current.time;
    const tz = current.timezone;
    if (!t) return null;
    try {
      const dt = new Date(t);
      if (tz) {
        return new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: tz,
        }).format(dt);
      }
      return dt.toLocaleString();
    } catch {
      return t;
    }
  })();

  const metaCards: JSX.Element[] = [];

  metaCards.push(
    <Box key="wind" sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
      <Card className="glass-meta-card">
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <AirIcon fontSize="small" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Wind Speed
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {current.windSpeedKmh} km/h
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  if (formattedTime) {
    metaCards.push(
      <Box key="time" sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
        <Card className="glass-meta-card">
          <CardContent>
            <Typography variant="caption" color="text.secondary">
              Local Time
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formattedTime}
            </Typography>
            {current.timezone && (
              <Typography variant="caption" color="text.secondary">
                Timezone: {current.timezone}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (selected) {
    metaCards.push(
      <Box
        key="location"
        sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}
      >
        <Card className="glass-meta-card">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOnIcon fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" fontWeight="bold" noWrap>
                  {formatLocationLabel(selected)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (typeof current.uvIndex === "number") {
    metaCards.push(
      <Box key="uv" sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
        <Card className="glass-meta-card uv-card">
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Ultraviolet Index" arrow>
                <WbSunnyIcon
                  fontSize="small"
                  sx={{ color: getUVColor(current.uvIndex) }}
                />
              </Tooltip>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  UV Index
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: getUVColor(current.uvIndex) }}
                >
                  {current.uvIndex}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Card className="glass-card current-card" sx={{ mb: 3 }}>
      <CardContent>
        <Box className="current-main">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Live conditions
            </Typography>
            <Typography variant="h2" className="current-temp">
              {current.temperatureC}
              <Typography component="span" className="unit">
                °C
              </Typography>
            </Typography>
            <Chip
              label={weatherCodeToText(current.weatherCode)}
              className="weather-chip"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        {metaCards.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            {metaCards}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function getUVColor(value: number): string {
  if (value < 3) return "#7ED957"; // low - green
  if (value < 6) return "#FFEA00"; // moderate - yellow
  if (value < 8) return "#FF8C00"; // high - orange
  if (value < 11) return "#FF443A"; // very high - red
  return "#9B30FF"; // extreme - violet
}
