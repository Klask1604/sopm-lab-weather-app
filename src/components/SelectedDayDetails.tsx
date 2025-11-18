import { Card, CardContent, Chip, Typography, Box, Divider } from "@mui/material";
import type { DailyForecast } from "../types";
import { weatherCodeToText } from "../types";

type Props = {
  selectedDay: DailyForecast | null;
};

function formatDateTime(value?: string) {
  if (!value) return null;
  try {
    const date = new Date(value);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function SelectedDayDetails({ selectedDay }: Props) {
  if (!selectedDay) {
    return (
      <Card className="glass-card day-details-card placeholder-card">
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Daily preview
          </Typography>
          <Typography variant="h5" gutterBottom>
            Choose a day
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tap any card in the 5-day forecast to see sunrise, wind, UV, and more
            for that specific day.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  const dateLabel = new Date(selectedDay.date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const sunrise = formatDateTime(selectedDay.sunrise);
  const sunset = formatDateTime(selectedDay.sunset);
  return (
    <Card className="glass-card day-details-card">
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Daily preview
        </Typography>
        <Typography variant="h5" gutterBottom>
          {dateLabel}
        </Typography>
        <Chip
          label={weatherCodeToText(selectedDay.weatherCode)}
          className="weather-chip"
          sx={{ mb: 2 }}
        />

        <Box className="forecast-temps">
          <Typography component="span" className="tmax" variant="h4">
            {Math.round(selectedDay.tMaxC)}°
          </Typography>
          <Typography component="span" className="divider">
            /
          </Typography>
          <Typography component="span" className="tmin" variant="h5">
            {Math.round(selectedDay.tMinC)}°
          </Typography>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.2 }} />

        <Box className="day-details-grid">
          {sunrise && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Sunrise
              </Typography>
              <Typography variant="body1">{sunrise}</Typography>
            </div>
          )}
          {sunset && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Sunset
              </Typography>
              <Typography variant="body1">{sunset}</Typography>
            </div>
          )}
          {selectedDay.precipitationProbability != null && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Precipitation chance
              </Typography>
              <Typography variant="body1">
                {selectedDay.precipitationProbability}%
              </Typography>
            </div>
          )}
          {selectedDay.windSpeedMaxKmh != null && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Max wind
              </Typography>
              <Typography variant="body1">
                {Math.round(selectedDay.windSpeedMaxKmh)} km/h
              </Typography>
            </div>
          )}
          {selectedDay.uvIndexMax != null && (
            <div>
              <Typography variant="caption" color="text.secondary">
                UV Index
              </Typography>
              <Typography variant="body1">{selectedDay.uvIndexMax}</Typography>
            </div>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          Click another day to preview different data, or click the selected card again to clear.
        </Typography>
      </CardContent>
    </Card>
  );
}


