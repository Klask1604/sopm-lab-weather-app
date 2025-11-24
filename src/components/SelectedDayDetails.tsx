import { Card, CardContent, Chip, Typography, Box, Divider } from "@mui/material";
import type { DailyForecast } from "../types";
import { weatherCodeToText } from "../types";
import type { JSX } from "react";

type Props = {
  selectedDay: DailyForecast | null;
  forecast?: DailyForecast[];
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

export default function SelectedDayDetails({ selectedDay, forecast = [] }: Props) {
  // Helper: render the main daily preview card (selected or placeholder)
  const mainCard = selectedDay ? (
    <Card className="glass-card day-details-card">
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          Daily preview
        </Typography>
        <Typography variant="h5" gutterBottom>
          {new Date(selectedDay.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
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
          {formatDateTime(selectedDay.sunrise) && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Sunrise
              </Typography>
              <Typography variant="body1">{formatDateTime(selectedDay.sunrise)}</Typography>
            </div>
          )}
          {formatDateTime(selectedDay.sunset) && (
            <div>
              <Typography variant="caption" color="text.secondary">
                Sunset
              </Typography>
              <Typography variant="body1">{formatDateTime(selectedDay.sunset)}</Typography>
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
  ) : (
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

  // Temperature chart card (shows next 5 days temps)
  const chartCard = (forecast && forecast.length > 0) ? (
    <Card className="glass-card temps-chart-card" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          5-Day Temperature
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Daily high and low temperatures for the next days
        </Typography>
        <Box>
          <TemperatureChart data={forecast} />
        </Box>
      </CardContent>
    </Card>
  ) : null;

  return (
    <>
      {mainCard}
      {chartCard}
    </>
  );
}

function TemperatureChart({ data }: { data: DailyForecast[] }): JSX.Element {
  
  const count = Math.max(1, data.length);
  const temps = data.flatMap((d) => [d.tMinC, d.tMaxC]);
  const minTemp = Math.min(...temps) - 1;
  const maxTemp = Math.max(...temps) + 1;
  const pad = 8; 
  const viewW = 300; 
  const viewH = 140; 
  const labelArea = 18;
  const plotH = viewH - labelArea; 

  const xFor = (i: number) => {
    if (count === 1) return viewW / 2;
    return (i / (count - 1)) * (viewW - pad * 2) + pad;
  };

  const yFor = (t: number) => {
    const r = maxTemp - minTemp || 1;
    
    const ratio = (t - minTemp) / r;
  
    return plotH - (ratio * (plotH - pad * 2) + pad);
  };

  const highPoints = data.map((d, i) => ({ x: xFor(i), y: yFor(d.tMaxC), date: d.date, v: d.tMaxC }));
  const lowPoints = data.map((d, i) => ({ x: xFor(i), y: yFor(d.tMinC), date: d.date, v: d.tMinC }));

  const pathFromPoints = (pts: { x: number; y: number }[]) =>
    pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  const highPath = pathFromPoints(highPoints);
  const lowPath = pathFromPoints(lowPoints);

  return (
    <Box sx={{ width: '100%' }}>
      <svg className="temps-chart" viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet" width="100%" height={140}>
      
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = plotH - (r * (plotH - pad * 2) + pad);
          return <line key={r} x1={pad} x2={viewW - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />;
        })}

        <path d={highPath} fill="none" stroke="#FF8C00" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={lowPath} fill="none" stroke="#42A5F5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        
        {highPoints.map((p) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r={3} fill="#FF8C00" stroke="rgba(255,255,255,0.85)" strokeWidth={0.8} />
            <text x={p.x} y={p.y - 6} fill="#FFB980" fontSize={10} textAnchor="middle">{Math.round(p.v)}°</text>
          </g>
        ))}

        {lowPoints.map((p) => (
          <g key={`low-${p.date}`}>
            <circle cx={p.x} cy={p.y} r={3} fill="#42A5F5" stroke="rgba(255,255,255,0.85)" strokeWidth={0.8} />
            <text x={p.x} y={p.y + 14} fill="#9FD5FF" fontSize={9} textAnchor="middle">{Math.round(p.v)}°</text>
          </g>
        ))}

        
        {highPoints.map((p) => (
          <text key={`lbl-${p.date}`} x={p.x} y={viewH - 4} fontSize={9} fill="rgba(255,255,255,0.75)" textAnchor="middle">
            {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
          </text>
        ))}
      </svg>
    </Box>
  );
}


