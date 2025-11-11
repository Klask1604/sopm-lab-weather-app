import { Card, List, ListItem, ListItemButton, Typography } from "@mui/material";
import { LocationOn as LocationOnIcon } from "@mui/icons-material";
import type { GeoResult } from "../types";

type Props = {
  results: GeoResult[];
  onSelect: (place: GeoResult) => void;
  formatLabel: (place: GeoResult) => string;
};

export default function ResultsList({ results, onSelect, formatLabel }: Props) {
  if (results.length === 0) return null;
  return (
    <Card className="glass-card results-list" sx={{ mt: 2 }}>
      <List>
        {results.map((r) => (
          <ListItem key={r.id} disablePadding>
            <ListItemButton onClick={() => onSelect(r)} className="result-item">
              <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography>{formatLabel(r)}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Card>
  );
}


