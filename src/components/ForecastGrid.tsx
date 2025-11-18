import { Card, CardContent, Chip, Typography, Box } from "@mui/material";
import type { DailyForecast } from "../types";
import { weatherCodeToText } from "../types";

type Props = {
  forecast: DailyForecast[];
  selectedDate: string | null;
  onSelectDay: (day: DailyForecast) => void;
};

export default function ForecastGrid({ forecast, selectedDate, onSelectDay }: Props) {
  if (!forecast || forecast.length === 0) return null;
  return (
    <Box className="forecast-grid" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {forecast.map((d) => (
        <Box
          key={d.date}
          sx={{
            flex: "1 1 calc(20% - 16px)",
            minWidth: { xs: "calc(50% - 8px)", sm: "calc(33.333% - 11px)", md: "calc(20% - 13px)" },
            maxWidth: { xs: "calc(50% - 8px)", sm: "calc(33.333% - 11px)", md: "calc(20% - 13px)" },
          }}
        >
          <Card
            className={`glass-card forecast-card ${selectedDate === d.date ? "forecast-selected" : ""}`}
            onClick={() => onSelectDay(d)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectDay(d);
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight="bold" className="forecast-date">
                {new Date(d.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
              <Chip
                label={weatherCodeToText(d.weatherCode)}
                size="small"
                className="weather-chip"
                sx={{ mt: 1, mb: 1 }}
              />
              <Box className="forecast-temps">
                <Typography component="span" className="tmax" variant="h6">
                  {Math.round(d.tMaxC)}°
                </Typography>
                <Typography component="span" className="divider">
                  /
                </Typography>
                <Typography component="span" className="tmin" variant="body2">
                  {Math.round(d.tMinC)}°
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}


