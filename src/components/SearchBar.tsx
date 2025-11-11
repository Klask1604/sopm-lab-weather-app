import { Button, CircularProgress, TextField } from "@mui/material";
import { MyLocation as MyLocationIcon, Search as SearchIcon } from "@mui/icons-material";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  isSearching: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onUseMyLocation: () => void;
};

export default function SearchBar({ query, onQueryChange, isSearching, onSubmit, onUseMyLocation }: Props) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <TextField
        fullWidth
        placeholder="Search city (e.g., London)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="glass-input"
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: "primary.main" }} />
          ),
        }}
      />
      <Button
        variant="contained"
        type="submit"
        disabled={isSearching}
        startIcon={
          isSearching ? <CircularProgress size={16} /> : <SearchIcon />
        }
        className="glass-button"
      >
        {isSearching ? "Searching…" : "Search"}
      </Button>
      <Button
        variant="outlined"
        type="button"
        onClick={onUseMyLocation}
        startIcon={<MyLocationIcon />}
        className="glass-button"
      >
        My Location
      </Button>
    </form>
  );
}


