import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Fab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Search,
} from '@mui/icons-material';
import { useNotification } from '../components/Notification';

const API_URL = '/api/items';

function Item() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    item_name: '',
    item_code: '',
    opening_value: '',
    hsn_code: '',
    gst_rate: '',
    opening_quantity: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGSTRate, setFilterGSTRate] = useState('All Rates');
  const [filterStockStatus, setFilterStockStatus] = useState('All Stock Status');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setItems(Array.isArray(data) ? data : []);
      setFilteredItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      showNotification('Failed to fetch items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentItem.id}`, currentItem);
        showNotification('Item updated successfully', 'success');
      } else {
        await axios.post(API_URL, currentItem);
        showNotification('Item created successfully', 'success');
      }
      fetchItems();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('Item deleted successfully', 'success');
        fetchItems();
      } catch (error) {
        showNotification('Failed to delete item', 'error');
      }
    }
  };

  const openModal = () => {
    setCurrentItem({
      item_name: '',
      item_code: '',
      opening_value: '',
      hsn_code: '',
      gst_rate: '',
      opening_quantity: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
  };

  useEffect(() => {
    let result = [...items];

    if (searchQuery) {
      result = result.filter(item =>
        item.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hsn_code?.includes(searchQuery)
      );
    }

    if (filterGSTRate !== 'All Rates') {
      result = result.filter(item => item.gst_rate === parseInt(filterGSTRate));
    }

    if (filterStockStatus !== 'All Stock Status') {
      result = result.filter(item => {
        const qty = parseInt(item.opening_quantity) || 0;
        if (filterStockStatus === 'In Stock') return qty > 10;
        if (filterStockStatus === 'Low Stock') return qty > 0 && qty <= 10;
        if (filterStockStatus === 'Out of Stock') return qty === 0;
        return true;
      });
    }

    setFilteredItems(result);
  }, [searchQuery, filterGSTRate, filterStockStatus, items]);

  const tableHeaderStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#2d3748',
    backgroundColor: '#f7fafc',
    fontSize: '0.9rem',
    letterSpacing: '-0.01em',
  };

  const tableCellStyle = (align = 'left') => ({
    padding: '12px 14px',
    textAlign: align,
    fontSize: '0.95rem',
    color: '#2d3748',
  });

  const tableRowStyle = (index) => ({
    borderBottom: '1px solid #e7e9ed',
    backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb',
    transition: 'background-color 0.2s ease',
  });

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: isMobile ? 10 : 4 }}>
      {/* Page Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', py: 2, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" color="#333" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Item
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openModal}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              flex: isMobile ? '1 1 auto' : '0 0 auto',
            }}
          >
            Add Item
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchItems}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              textTransform: 'none',
              flex: isMobile ? '0 0 auto' : '0 0 auto',
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search items"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2, bgcolor: 'white', maxWidth: { xs: '100%', sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            select
            label="GST Rate"
            value={filterGSTRate}
            onChange={(e) => setFilterGSTRate(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Rates">All Rates</MenuItem>
            <MenuItem value="0">0%</MenuItem>
            <MenuItem value="5">5%</MenuItem>
            <MenuItem value="12">12%</MenuItem>
            <MenuItem value="18">18%</MenuItem>
            <MenuItem value="28">28%</MenuItem>
          </TextField>

          <TextField
            select
            label="Stock Status"
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            sx={{ minWidth: 180, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Stock Status">All Stock Status</MenuItem>
            <MenuItem value="In Stock">In Stock (&gt;10)</MenuItem>
            <MenuItem value="Low Stock">Low Stock (1-10)</MenuItem>
            <MenuItem value="Out of Stock">Out of Stock (0)</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={() => {
              setFilterGSTRate('All Rates');
              setFilterStockStatus('All Stock Status');
              setSearchQuery('');
            }}
            sx={{
              textTransform: 'none',
              borderColor: '#999',
              color: '#666',
              flex: { xs: '1 1 100%', sm: '0 0 auto' },
            }}
          >
            Clear Filters
          </Button>
        </Box>

        {/* Item Cards - Mobile | Table - Desktop */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
              <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
            ) : filteredItems.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#999' }}>No items found</Typography>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1rem', mb: 0.5 }}>
                          {item.item_name}
                        </Typography>
                        <Chip
                          label={item.item_code}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.item_code}  Qty: {item.opening_quantity || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      HSN {item.hsn_code}  GST {item.gst_rate}%
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(item)}
                        sx={{
                          borderColor: '#667eea',
                          color: '#667eea',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(item.id)}
                        sx={{
                          borderColor: '#dc3545',
                          color: '#dc3545',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          <Card sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={tableHeaderStyle}>Item</th>
                    <th style={tableHeaderStyle}>Code</th>
                    <th style={tableHeaderStyle}>Part</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>MRP</th>
                    <th style={tableHeaderStyle}>HSN</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>GST</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>Loading...</td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No items found</td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr 
                        key={item.id}
                        style={tableRowStyle(index)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef1f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{ ...tableCellStyle(), fontWeight: 700 }}>{item.item_name}</td>
                        <td style={tableCellStyle()}>{item.item_code}</td>
                        <td style={tableCellStyle()}>{item.part_number || '-'}</td>
                        <td style={{ ...tableCellStyle('right'), fontWeight: 700 }}>₹{item.mrp}</td>
                        <td style={tableCellStyle()}>{item.hsn_code}</td>
                        <td style={{ ...tableCellStyle('right') }}>{item.gst_rate}%</td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEdit(item)}
                            sx={{
                              borderColor: '#667eea',
                              color: '#667eea',
                              textTransform: 'none',
                              fontSize: '0.875rem',
                              mr: 1,
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Delete />}
                            onClick={() => handleDelete(item.id)}
                            sx={{
                              borderColor: '#dc3545',
                              color: '#dc3545',
                              textTransform: 'none',
                              fontSize: '0.875rem',
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          </Card>
        )}
      </Box>

      {/* Floating Action Button - Mobile Only */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={openModal}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #65408c 100%)',
            },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={showModal}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '16px',
            maxWidth: isMobile ? '100%' : '600px',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontWeight: 600 }}>
          {editMode ? 'Edit Item' : 'Add Item'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Item Code"
                value={currentItem.item_code}
                onChange={(e) => setCurrentItem({ ...currentItem, item_code: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Item Name"
                value={currentItem.item_name}
                onChange={(e) => setCurrentItem({ ...currentItem, item_name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="HSN Code"
                value={currentItem.hsn_code}
                onChange={(e) => setCurrentItem({ ...currentItem, hsn_code: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="GST Rate"
                value={currentItem.gst_rate}
                onChange={(e) => setCurrentItem({ ...currentItem, gst_rate: e.target.value })}
                fullWidth
              >
                <MenuItem value="0">0%</MenuItem>
                <MenuItem value="5">5%</MenuItem>
                <MenuItem value="12">12%</MenuItem>
                <MenuItem value="18">18%</MenuItem>
                <MenuItem value="28">28%</MenuItem>
              </TextField>
              <TextField
                label="Opening Quantity"
                type="number"
                value={currentItem.opening_quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, opening_quantity: e.target.value })}
                fullWidth
              />
              <TextField
                label="Opening Value"
                type="number"
                value={currentItem.opening_value}
                onChange={(e) => setCurrentItem({ ...currentItem, opening_value: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button onClick={closeModal} sx={{ textTransform: 'none', color: '#666' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
              }}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Item;
