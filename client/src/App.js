import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import { Build, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import HomePage from './components/HomePage';
import SearchResults from './components/SearchResults';
import SearchHistory from './components/SearchHistory';
import ShoppingCart from './components/ShoppingCart';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Build sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Auto Parts Finder
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setCartOpen(true)}
          >
            <Badge badgeContent={3} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/history" element={<SearchHistory />} />
          </Routes>
        </Box>
      </Container>

      <ShoppingCart 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
      />
    </div>
  );
}

export default App;