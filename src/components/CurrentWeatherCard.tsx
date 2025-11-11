import { Card, CardContent, Chip, Typography, Box } from "@mui/material";
import { Air as AirIcon, LocationOn as LocationOnIcon } from "@mui/icons-material";
import type { CurrentWeather, GeoResult } from "../types";
import { formatLocationLabel, weatherCodeToText } from "../types";

type Props = {
  current: CurrentWeather | null;
  selected: GeoResult | null;
};

export default function CurrentWeatherCard({ current, selected }: Props) {
  if (!current) return null;
  return (
    <Card className="glass-card current-card" sx={{ mb: 3 }}>
      <CardContent>
        <Box className="current-main">
          <Box>
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
        <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
          <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
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
          {selected && (
            <Box sx={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
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
          )}
        </Box>
      </CardContent>
    </Card>
  );
}


