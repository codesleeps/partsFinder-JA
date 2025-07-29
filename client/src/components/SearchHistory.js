import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Chip,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

function SearchHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get('/api/search-history/1'); // Mock user ID
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const repeatSearch = async (historyItem) => {
    try {
      const searchParams = {
        make: historyItem.vehicle_make,
        model: historyItem.vehicle_model,
        year: historyItem.vehicle_year,
        category: historyItem.part_category,
        query: historyItem.search_query || ''
      };

      const response = await axios.post('/api/parts/search', {
        ...searchParams,
        userId: 1
      });
      
      navigate('/search', { 
        state: { 
          results: response.data, 
          searchParams 
        } 
      });
    } catch (error) {
      console.error('Repeat search error:', error);
      alert('Search failed. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Search
      </Button>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Search History
        </Typography>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : history.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No search history found. Start searching for parts to see your history here.
          </Typography>
        ) : (
          <List>
            {history.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="h6">
                      {item.vehicle_year} {item.vehicle_make} {item.vehicle_model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.created_at)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={item.part_category} size="small" color="primary" />
                    {item.search_query && (
                      <Chip label={`"${item.search_query}"`} size="small" variant="outlined" />
                    )}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SearchIcon />}
                    onClick={() => repeatSearch(item)}
                  >
                    Search Again
                  </Button>
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default SearchHistory;