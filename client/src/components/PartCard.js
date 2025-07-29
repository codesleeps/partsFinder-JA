import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Divider,
  Grid
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite,
  FavoriteBorder,
  Info,
  LocalShipping,
  Verified
} from '@mui/icons-material';

function PartCard({ part, onAddToCart, onToggleFavorite, isFavorite = false }) {
  const [showDetails, setShowDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(part, quantity);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability.toLowerCase()) {
      case 'in stock':
        return 'success';
      case 'limited stock':
        return 'warning';
      case 'out of stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getShippingInfo = (price) => {
    if (price > 100) return 'Free Shipping';
    if (price > 50) return '$5.99 Shipping';
    return '$9.99 Shipping';
  };

  return (
    <>
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ flexGrow: 1, pr: 1 }}>
              {part.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onToggleFavorite(part.id)}
              color={isFavorite ? 'error' : 'default'}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={part.availability}
              color={getAvailabilityColor(part.availability)}
              size="small"
            />
            {part.isOEM && (
              <Chip
                icon={<Verified />}
                label="OEM"
                color="primary"
                size="small"
              />
            )}
            {part.warranty && (
              <Chip
                label={`${part.warranty} Warranty`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Part #: {part.partNumber}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Brand: {part.brand}
          </Typography>

          {part.rating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={part.rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({part.reviewCount} reviews)
              </Typography>
            </Box>
          )}

          <Typography variant="body2" sx={{ mb: 2 }}>
            {part.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocalShipping sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {getShippingInfo(part.price)}
            </Typography>
          </Box>
        </CardContent>

        <Divider />

        <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${part.price}
            </Typography>
            {part.originalPrice && part.originalPrice > part.price && (
              <Typography 
                variant="body2" 
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                ${part.originalPrice}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<Info />}
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={part.availability.toLowerCase() === 'out of stock'}
            >
              Add to Cart
            </Button>
          </Box>
        </CardActions>
      </Card>

      {/* Part Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {part.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Part Information</Typography>
              <Typography><strong>Part Number:</strong> {part.partNumber}</Typography>
              <Typography><strong>Brand:</strong> {part.brand}</Typography>
              <Typography><strong>Category:</strong> {part.category}</Typography>
              <Typography><strong>Availability:</strong> {part.availability}</Typography>
              {part.weight && <Typography><strong>Weight:</strong> {part.weight} lbs</Typography>}
              {part.dimensions && <Typography><strong>Dimensions:</strong> {part.dimensions}</Typography>}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Compatibility</Typography>
              <Typography><strong>Fits:</strong> {part.compatibility || 'Multiple vehicles'}</Typography>
              {part.engineTypes && (
                <Typography><strong>Engine Types:</strong> {part.engineTypes.join(', ')}</Typography>
              )}
              {part.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Installation Notes</Typography>
                  <Typography>{part.notes}</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography>{part.fullDescription || part.description}</Typography>
          </Box>

          {part.features && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Features</Typography>
              <ul>
                {part.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={part.availability.toLowerCase() === 'out of stock'}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PartCard;