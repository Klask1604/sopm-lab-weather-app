import { Box, Typography } from "@mui/material";
import type { DailyForecast } from "../types";
import { weatherCodeToText } from "../types";

type Props = {
  forecast: DailyForecast[];
  selectedDate: string | null;
  onSelectDay: (day: DailyForecast) => void;
};

export default function ForecastGrid({
  forecast,
  selectedDate,
  onSelectDay,
}: Props) {
  if (!forecast || forecast.length === 0) return null;
  return (
    <Box
      className="forecast-grid forecast-scroll"
      role="listbox"
      aria-label="5 day forecast"
      sx={{ p: 2 }}
    >
      {forecast.map((d) => (
        <button
          key={d.date}
          className={`forecast-pill ${
            selectedDate === d.date ? "selected" : ""
          }`}
          onClick={() => onSelectDay(d)}
          role="option"
          aria-selected={selectedDate === d.date}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectDay(d);
            }
          }}
        >
          <Typography variant="caption" className="pill-label">
            {new Date(d.date).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Typography>
          <Typography variant="body1" className="pill-temp">
            {Math.round(d.tMaxC)}° / {Math.round(d.tMinC)}°
          </Typography>
          <Typography variant="caption" className="pill-desc">
            {weatherCodeToText(d.weatherCode)}
          </Typography>
        </button>
      ))}
    </Box>
  );
}
