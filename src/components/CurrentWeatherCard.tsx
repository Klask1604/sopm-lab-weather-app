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
    const uvValue = Math.max(0, current.uvIndex);
    const uvPercent = Math.min(100, (Math.min(uvValue, 11) / 11) * 100);

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
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  UV Index
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  sx={{ color: getUVColor(current.uvIndex) }}
                >
                  {Number.isFinite(uvValue) ? Math.round(uvValue * 10) / 10 : uvValue}
                </Typography>

                
                <Box sx={{ mt: 1 }}>
                  <Box
                    className="uv-bar-wrap"
                    sx={{
                      position: "relative",
                      height: 10,
                      borderRadius: 99,
                      overflow: "hidden",
                      background: "linear-gradient(90deg, #7ED957 0%, #7ED957 25%, #FFEA00 25%, #FFEA00 45%, #FF8C00 45%, #FF8C00 65%, #FF443A 65%, #FF443A 95%, #9B30FF 95%, #9B30FF 100%)",
                    }}
                  >
                    <Box
                      className="uv-marker"
                      role="img"
                      aria-label={`UV index ${uvValue}`}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: `${uvPercent}%`,
                        transform: "translate(-50%, -50%)",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.95)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                        background: getUVColor(uvValue),
                      }}
                    />
                  </Box>
                </Box>
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
  if (value < 3) return "#7ED957"; 
  if (value < 6) return "#FFEA00"; 
  if (value < 8) return "#FF8C00"; 
  if (value < 11) return "#FF443A"; 
  return "#9B30FF"; 
}
