import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Pagination,
  Alert,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PartCard from './PartCard';
import SearchFilters from './SearchFilters';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], searchParams = {} } = location.state || {};
  
  const [filteredResults, setFilteredResults] = useState(results);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const itemsPerPage = 12;

  useEffect(() => {
    // Enhance results with additional mock data for demo
    const enhancedResults = results.map(part => ({
      ...part,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      reviewCount: Math.floor(Math.random() * 100) + 10,
      isOEM: Math.random() > 0.6,
      warranty: Math.random() > 0.5 ? '2 Year' : '1 Year',
      originalPrice: Math.random() > 0.7 ? part.price + Math.floor(Math.random() * 50) : null,
      features: [
        'High-quality materials',
        'Perfect fit guarantee',
        'Easy installation',
        'Tested for durability'
      ].slice(0, Math.floor(Math.random() * 3) + 2)
    }));
    setFilteredResults(enhancedResults);
  }, [results]);

  const handleFiltersChange = (filters) => {
    let filtered = [...results];

    // Price range filter
    filtered = filtered.filter(part => 
      part.price >= filters.priceRange[0] && part.price <= filters.priceRange[1]
    );

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(part => filters.brands.includes(part.brand));
    }

    // Availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(part => filters.availability.includes(part.availability));
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(part => (part.rating || 0) >= filters.rating);
    }

    // Additional filters
    if (filters.isOEM) {
      filtered = filtered.filter(part => part.isOEM);
    }
    if (filters.hasWarranty) {
      filtered = filtered.filter(part => part.warranty);
    }
    if (filters.freeShipping) {
      filtered = filtered.filter(part => part.price > 100);
    }

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    
    let sorted = [...filteredResults];
    switch (newSortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order for relevance
        break;
    }
    setFilteredResults(sorted);
  };

  const handleAddToCart = (part, quantity = 1) => {
    setSnackbar({
      open: true,
      message: `Added ${part.name} to cart!`,
      severity: 'success'
    });
  };

  const handleToggleFavorite = (partId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(partId)) {
      newFavorites.delete(partId);
      setSnackbar({
        open: true,
        message: 'Removed from favorites',
        severity: 'info'
      });
    } else {
      newFavorites.add(partId);
      setSnackbar({
        open: true,
        message: 'Added to favorites',
        severity: 'success'
      });
    }
    setFavorites(newFavorites);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!results.length) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Search
        </Button>
        <Alert severity="info">
          No results found. Try adjusting your search criteria.
        </Alert>
      </Box>
    );
  }

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Search
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Search Results
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Parts for {searchParams.year} {searchParams.make} {searchParams.model} - {searchParams.category}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredResults.length)} of {filteredResults.length} parts
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort by">
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
              <MenuItem value="name">Name A-Z</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <SearchFilters onFiltersChange={handleFiltersChange} />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {currentItems.map((part) => (
              <Grid item xs={12} lg={6} key={part.id}>
                <PartCard
                  part={part}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={favorites.has(part.id)}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/')}
        >
          Search for More Parts
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SearchResults;