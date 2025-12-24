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

const API_URL = '/api/districts';
const initialState = {
  district_name: '',
  district_code: '',
  state: '',
  postal_code: '',
  zone_region: '',
  active_status: 'Active',
  remarks: ''
};

function District() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();

  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState(initialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('All States');
  const [filterZone, setFilterZone] = useState('All Zones');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const getUniqueStates = () => {
    const states = [...new Set(districts.map(d => d.state).filter(Boolean))];
    return states.sort();
  };

  const getUniqueZones = () => {
    const zones = [...new Set(districts.map(d => d.zone_region).filter(Boolean))];
    return zones.sort();
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setDistricts(Array.isArray(data) ? data : []);
      setFilteredDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      showNotification('Failed to fetch districts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (district) => {
    setCurrentDistrict(district);
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentDistrict.id}`, currentDistrict);
        showNotification('District updated successfully', 'success');
      } else {
        await axios.post(API_URL, currentDistrict);
        showNotification('District created successfully', 'success');
      }
      fetchDistricts();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save district', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this district?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('District deleted successfully', 'success');
        fetchDistricts();
      } catch (error) {
        showNotification('Failed to delete district', 'error');
      }
    }
  };

  const openModal = () => {
    setCurrentDistrict(initialState);
    setEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentDistrict(initialState);
  };

  useEffect(() => {
    let result = [...districts];

    if (searchQuery) {
      result = result.filter(district =>
        district.district_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        district.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        district.district_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterState !== 'All States') {
      result = result.filter(district => district.state === filterState);
    }

    if (filterZone !== 'All Zones') {
      result = result.filter(district => district.zone_region === filterZone);
    }

    if (filterStatus !== 'All Status') {
      result = result.filter(district => district.active_status === filterStatus);
    }

    setFilteredDistricts(result);
  }, [searchQuery, filterState, filterZone, filterStatus, districts]);

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
          District
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
            Add District
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchDistricts}
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
          placeholder="Search by district name, code or state"
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
            label="State"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            sx={{ minWidth: 180, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All States">All States</MenuItem>
            {getUniqueStates().map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Zone/Region"
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            sx={{ minWidth: 180, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Zones">All Zones</MenuItem>
            {getUniqueZones().map(zone => (
              <MenuItem key={zone} value={zone}>{zone}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={() => {
              setFilterState('All States');
              setFilterZone('All Zones');
              setFilterStatus('All Status');
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

        {/* District Cards - Mobile | Table - Desktop */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
              <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
            ) : filteredDistricts.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#999' }}>No districts found</Typography>
            ) : (
              filteredDistricts.map((district) => (
                <Card
                  key={district.id}
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
                          {district.district_name}
                        </Typography>
                        <Chip
                          label={district.district_code}
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
                      {district.state}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Pin: {district.postal_code}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(district)}
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
                        onClick={() => handleDelete(district.id)}
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
                    <th style={tableHeaderStyle}>District</th>
                    <th style={tableHeaderStyle}>State</th>
                    <th style={tableHeaderStyle}>Code</th>
                    <th style={tableHeaderStyle}>Pin</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>Loading...</td>
                    </tr>
                  ) : filteredDistricts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No districts found</td>
                    </tr>
                  ) : (
                    filteredDistricts.map((district, index) => (
                      <tr 
                        key={district.id}
                        style={tableRowStyle(index)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef1f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{ ...tableCellStyle(), fontWeight: 700 }}>{district.district_name}</td>
                        <td style={tableCellStyle()}>{district.state}</td>
                        <td style={tableCellStyle()}>{district.district_code}</td>
                        <td style={tableCellStyle()}>{district.postal_code}</td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEdit(district)}
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
                            onClick={() => handleDelete(district.id)}
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
          {editMode ? 'Edit District' : 'Add District'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="District Code"
                value={currentDistrict.district_code}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, district_code: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="District Name"
                value={currentDistrict.district_name}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, district_name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="State"
                value={currentDistrict.state}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, state: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={currentDistrict.postal_code}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, postal_code: e.target.value })}
                fullWidth
              />
              <TextField
                label="Zone/Region"
                value={currentDistrict.zone_region}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, zone_region: e.target.value })}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={currentDistrict.active_status}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, active_status: e.target.value })}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
              <TextField
                label="Remarks"
                value={currentDistrict.remarks}
                onChange={(e) => setCurrentDistrict({ ...currentDistrict, remarks: e.target.value })}
                multiline
                rows={2}
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

export default District;
