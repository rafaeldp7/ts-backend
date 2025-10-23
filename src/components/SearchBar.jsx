import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Box, 
  IconButton, 
  InputAdornment,
  Autocomplete,
  Chip,
  Typography
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
  suggestions = [],
  showFilters = false,
  onFilterClick,
  searchTypes = []
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery, selectedType);
    }
  }, [debouncedQuery, selectedType, onSearch]);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedType(null);
    onSearch('', null);
  };

  const handleTypeChange = (event, newValue) => {
    setSelectedType(newValue);
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery, newValue);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} width="100%">
      <Box flex={1}>
        <Autocomplete
          freeSolo
          options={suggestions}
          value={query}
          onInputChange={(event, newInputValue) => {
            setQuery(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              placeholder={placeholder}
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {query && (
                      <IconButton onClick={handleClear} size="small">
                        <Clear />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1">{option}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Recent search
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      {searchTypes.length > 0 && (
        <Autocomplete
          value={selectedType}
          onChange={handleTypeChange}
          options={searchTypes}
          getOptionLabel={(option) => option.label || option}
          sx={{ minWidth: 150 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Type"
              variant="outlined"
              size="small"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option.label || option}
                {...getTagProps({ index })}
                key={index}
              />
            ))
          }
        />
      )}

      {showFilters && (
        <IconButton 
          onClick={onFilterClick}
          color={selectedType ? 'primary' : 'default'}
        >
          <FilterList />
        </IconButton>
      )}
    </Box>
  );
};

export default SearchBar;
