import React, { useState } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  Button,
  Box,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear
} from '@mui/icons-material';

function SearchFilters({ onFiltersChange, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    brands: [],
    availability: [],
    rating: 0,
    isOEM: false,
    hasWarranty: false,
    freeShipping: false,
    ...initialFilters
  });

  const availabilityOptions = ['In Stock', 'Limited Stock', 'Out of Stock'];
  const brandOptions = ['OEM', 'Bosch', 'ACDelco', 'Motorcraft', 'Beck Arnley', 'Febi', 'Gates', 'NGK'];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (filterType, option, checked) => {
    const currentArray = filters[filterType] || [];
    const newArray = checked
      ? [...currentArray, option]
      : currentArray.filter(item => item !== option);
    
    handleFilterChange(filterType, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceRange: [0, 1000],
      brands: [],
      availability: [],
      rating: 0,
      isOEM: false,
      hasWarranty: false,
      freeShipping: false
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.brands.length > 0) count++;
    if (filters.availability.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.isOEM) count++;
    if (filters.hasWarranty) count++;
    if (filters.freeShipping) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">
            Filters
          </Typography>
          {getActiveFilterCount() > 0 && (
            <Chip 
              label={getActiveFilterCount()} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Box>
        <Button
          size="small"
          startIcon={<Clear />}
          onClick={clearAllFilters}
          disabled={getActiveFilterCount() === 0}
        >
          Clear All
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Price Range */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={filters.priceRange}
              onChange={(_, newValue) => handleFilterChange('priceRange', newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              step={10}
              marks={[
                { value: 0, label: '$0' },
                { value: 250, label: '$250' },
                { value: 500, label: '$500' },
                { value: 750, label: '$750' },
                { value: 1000, label: '$1000+' }
              ]}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Min Price"
                type="number"
                size="small"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                label="Max Price"
                type="number"
                size="small"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                InputProps={{ startAdornment: '$' }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Brands */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Brands {filters.brands.length > 0 && `(${filters.brands.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {brandOptions.map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => handleArrayFilterChange('brands', brand, e.target.checked)}
                  />
                }
                label={brand}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Availability */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">
            Availability {filters.availability.length > 0 && `(${filters.availability.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {availabilityOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={filters.availability.includes(option)}
                    onChange={(e) => handleArrayFilterChange('availability', option, e.target.checked)}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Rating */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Minimum Rating</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={filters.rating}
              onChange={(_, newValue) => handleFilterChange('rating', newValue || 0)}
            />
            <Typography variant="body2">
              {filters.rating > 0 ? `${filters.rating} stars & up` : 'Any rating'}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Additional Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Additional Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.isOEM}
                  onChange={(e) => handleFilterChange('isOEM', e.target.checked)}
                />
              }
              label="OEM Parts Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasWarranty}
                  onChange={(e) => handleFilterChange('hasWarranty', e.target.checked)}
                />
              }
              label="Has Warranty"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.freeShipping}
                  onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                />
              }
              label="Free Shipping"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

export default SearchFilters;