import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';
import { searchService } from '../../services/searchService';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestions, setSuggestions] = useState([]);

  const searchTypes = [
    { value: 'users', label: 'Users' },
    { value: 'reports', label: 'Reports' },
    { value: 'gas-stations', label: 'Gas Stations' },
    { value: 'motorcycles', label: 'Motorcycles' },
    { value: 'trips', label: 'Trips' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'fuel-logs', label: 'Fuel Logs' }
  ];

  const handleSearch = async (query, type = null) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchQuery(query);
    setSearchType(type);

    try {
      let searchResults;
      
      if (type) {
        // Search specific entity type
        switch (type.value || type) {
          case 'users':
            searchResults = await searchService.searchUsers(query, currentPage, 20);
            break;
          case 'reports':
            searchResults = await searchService.searchReports(query, currentPage, 20);
            break;
          case 'gas-stations':
            searchResults = await searchService.searchGasStations(query, currentPage, 20);
            break;
          case 'motorcycles':
            searchResults = await searchService.searchMotorcycles(query, currentPage, 20);
            break;
          case 'trips':
            searchResults = await searchService.searchTrips(query, currentPage, 20);
            break;
          case 'maintenance':
            searchResults = await searchService.searchMaintenance(query, currentPage, 20);
            break;
          case 'fuel-logs':
            searchResults = await searchService.searchFuelLogs(query, currentPage, 20);
            break;
          default:
            searchResults = await searchService.globalSearch(query, currentPage, 20);
        }
      } else {
        // Global search
        searchResults = await searchService.globalSearch(query, currentPage, 20);
      }

      setResults(searchResults.data || searchResults);
      setTotalPages(searchResults.totalPages || 1);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (searchQuery) {
      handleSearch(searchQuery, searchType);
    }
  };

  const handleFilterClick = () => {
    // Implement filter modal or drawer
    console.log('Filter clicked');
  };

  // Load search suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const recentSearches = await searchService.getRecentSearches();
        setSuggestions(recentSearches.map(search => search.query));
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    };

    loadSuggestions();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Search TrafficSlight Data
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Search across users, trips, reports, gas stations, and more
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search users, trips, reports, gas stations..."
          suggestions={suggestions}
          showFilters={true}
          onFilterClick={handleFilterClick}
          searchTypes={searchTypes}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <SearchResults
        results={results}
        loading={loading}
        error={error}
        searchType={searchType?.value || searchType}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </Container>
  );
};

export default SearchPage;
