import React, { useState } from 'react';
import {
  Drawer,
  Typography,
  List,
  ListItem,
  IconButton,
  Button,
  Box,
  Divider,
  Badge,
  TextField,
  Alert,
  Paper
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Delete,
  Add,
  Remove,
  Close
} from '@mui/icons-material';

function ShoppingCart({ open, onClose }) {
  const [cartItems, setCartItems] = useState([
    // Mock cart data
    {
      id: 1,
      name: 'Brake Pads for 2020 Toyota Camry',
      partNumber: 'AP-BRK123456',
      price: 89.99,
      quantity: 2,
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Oil Filter for 2020 Toyota Camry',
      partNumber: 'AP-OIL789012',
      price: 24.99,
      quantity: 1,
      image: '/api/placeholder/100/100'
    }
  ]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getShippingCost = () => {
    const total = getTotalPrice();
    return total > 100 ? 0 : 9.99;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Shopping Cart
            {cartItems.length > 0 && (
              <Badge badgeContent={getTotalItems()} color="primary" sx={{ ml: 2 }}>
                <ShoppingCartIcon />
              </Badge>
            )}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {cartItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add some parts to get started
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {cartItems.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Part #: {item.partNumber}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Remove />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            inputProps={{ 
                              style: { textAlign: 'center', width: '40px' },
                              min: 1
                            }}
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            ${item.price} each
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                        
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${getTotalPrice().toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {getShippingCost() === 0 ? 'FREE' : `$${getShippingCost().toFixed(2)}`}
                </Typography>
              </Box>
              
              {getShippingCost() === 0 && (
                <Alert severity="success" sx={{ mb: 2, py: 0 }}>
                  Free shipping on orders over $100!
                </Alert>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${getFinalTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 1 }}
                onClick={() => alert('Proceeding to checkout...')}
              >
                Checkout
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </Paper>
          </>
        )}
      </Box>
    </Drawer>
  );
}

export default ShoppingCart;