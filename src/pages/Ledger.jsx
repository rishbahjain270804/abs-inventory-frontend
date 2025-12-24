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
  IconButton,
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
  Person,
} from '@mui/icons-material';
import { useNotification } from '../components/Notification';

const API_URL = '/api/ledgers';
const DISTRICTS_URL = '/api/districts';

const initialState = {
  party_code: '',
  party_name: '',
  party_type: 'Customer',
  address: '',
  state: '',
  district_code: '',
  district_name: '',
  postal_code: '',
  gstin: '',
  pan: '',
  contact_person: '',
  mobile_number: '',
  email: '',
  ledger_mapping: '',
  active_status: 'Active'
};

function Ledger() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification } = useNotification();

  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLedger, setCurrentLedger] = useState(initialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('All Groups');
  const [filterBalance, setFilterBalance] = useState('All Balances');
  const [filterState, setFilterState] = useState('All States');
  const [filterStatus, setFilterStatus] = useState('All Status');

  const getUniqueStates = () => {
    const states = [...new Set(districts.map(d => d.state).filter(Boolean))];
    return states.sort();
  };

  useEffect(() => {
    fetchLedgers();
    fetchDistricts();
  }, []);

  const fetchLedgers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setLedgers(Array.isArray(data) ? data : []);
      setFilteredLedgers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      showNotification('Failed to fetch ledgers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const { data } = await axios.get(DISTRICTS_URL);
      setDistricts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleEdit = (ledger) => {
    setCurrentLedger(ledger);
    setEditMode(true);
    setShowModal(true);
  };

  const handleStateChange = (state) => {
    setCurrentLedger({ ...currentLedger, state });
    const stateDistricts = districts.filter(d => d.state === state);
    setFilteredDistricts(stateDistricts);
    if (stateDistricts.length > 0) {
      const firstDistrict = stateDistricts[0];
      setCurrentLedger({
        ...currentLedger,
        state,
        district_name: firstDistrict.district_name,
        district_code: firstDistrict.district_code,
        postal_code: firstDistrict.postal_code
      });
    } else {
      setCurrentLedger({
        ...currentLedger,
        state,
        district_name: '',
        district_code: '',
        postal_code: ''
      });
    }
  };

  const handleDistrictChange = (districtName) => {
    const selectedDistrict = filteredDistricts.find(d => d.district_name === districtName);
    if (selectedDistrict) {
      setCurrentLedger({
        ...currentLedger,
        district_name: selectedDistrict.district_name,
        district_code: selectedDistrict.district_code,
        postal_code: selectedDistrict.postal_code
      });
    } else {
      setCurrentLedger({
        ...currentLedger,
        district_name: districtName,
        district_code: '',
        postal_code: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API_URL}/${currentLedger.id}`, currentLedger);
        showNotification('Party updated successfully', 'success');
      } else {
        await axios.post(API_URL, currentLedger);
        showNotification('Party created successfully', 'success');
      }
      fetchLedgers();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save party', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this party?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('Party deleted successfully', 'success');
        fetchLedgers();
      } catch (error) {
        showNotification('Failed to delete party', 'error');
      }
    }
  };

  const openModal = () => {
    setCurrentLedger(initialState);
    setEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentLedger(initialState);
  };

  useEffect(() => {
    let result = [...ledgers];

    if (searchQuery) {
      result = result.filter(ledger =>
        ledger.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ledger.mobile_number?.includes(searchQuery) ||
        ledger.party_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterGroup !== 'All Groups') {
      result = result.filter(ledger => ledger.party_type === filterGroup);
    }

    if (filterState !== 'All States') {
      result = result.filter(ledger => ledger.state === filterState);
    }

    if (filterStatus !== 'All Status') {
      result = result.filter(ledger => ledger.active_status === filterStatus);
    }

    setFilteredLedgers(result);
  }, [searchQuery, filterGroup, filterBalance, filterState, filterStatus, ledgers]);

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
          Ledger
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
            Add Party
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchLedgers}
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
          placeholder="Search by name or phone"
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
            label="Party Type"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Groups">All Groups</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="Supplier">Supplier</MenuItem>
          </TextField>

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
              setFilterGroup('All Groups');
              setFilterBalance('All Balances');
              setFilterState('All States');
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

        {/* Party Cards - Mobile | Table - Desktop */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
              <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
            ) : filteredLedgers.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#999' }}>No parties found</Typography>
            ) : (
              filteredLedgers.map((ledger) => (
                <Card
                  key={ledger.id}
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
                          {ledger.party_name}
                        </Typography>
                        <Chip
                          label={ledger.party_code}
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
                      {ledger.party_type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {ledger.contact_person}: {ledger.mobile_number}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(ledger)}
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
                        onClick={() => handleDelete(ledger.id)}
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
                    <th style={tableHeaderStyle}>Party</th>
                    <th style={tableHeaderStyle}>Code</th>
                    <th style={tableHeaderStyle}>Type</th>
                    <th style={tableHeaderStyle}>Contact</th>
                    <th style={tableHeaderStyle}>Phone</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>Loading...</td>
                    </tr>
                  ) : filteredLedgers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No parties found</td>
                    </tr>
                  ) : (
                    filteredLedgers.map((ledger, index) => (
                      <tr 
                        key={ledger.id}
                        style={tableRowStyle(index)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef1f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{ ...tableCellStyle(), fontWeight: 700 }}>{ledger.party_name}</td>
                        <td style={tableCellStyle()}>{ledger.party_code}</td>
                        <td style={tableCellStyle()}>{ledger.party_type}</td>
                        <td style={tableCellStyle()}>{ledger.contact_person}</td>
                        <td style={tableCellStyle()}>{ledger.mobile_number}</td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEdit(ledger)}
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
                            onClick={() => handleDelete(ledger.id)}
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
          {editMode ? 'Edit Party' : 'Add Party'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Party Code"
                value={currentLedger.party_code}
                onChange={(e) => setCurrentLedger({ ...currentLedger, party_code: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Party Name"
                value={currentLedger.party_name}
                onChange={(e) => setCurrentLedger({ ...currentLedger, party_name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                select
                label="Party Type"
                value={currentLedger.party_type}
                onChange={(e) => setCurrentLedger({ ...currentLedger, party_type: e.target.value })}
                fullWidth
              >
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="Supplier">Supplier</MenuItem>
                <MenuItem value="Dealer">Dealer</MenuItem>
              </TextField>
              <TextField
                label="Address"
                value={currentLedger.address}
                onChange={(e) => setCurrentLedger({ ...currentLedger, address: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                select
                label="State"
                value={currentLedger.state}
                onChange={(e) => handleStateChange(e.target.value)}
                required
                fullWidth
              >
                <option value="">Select State</option>
                {getUniqueStates().map(state => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="District"
                value={currentLedger.district_name}
                onChange={(e) => handleDistrictChange(e.target.value)}
                required
                fullWidth
                disabled={!currentLedger.state}
              >
                <option value="">Select District</option>
                {filteredDistricts.map(district => (
                  <MenuItem key={district.id} value={district.district_name}>
                    {district.district_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="District Code"
                value={currentLedger.district_code}
                onChange={(e) => setCurrentLedger({ ...currentLedger, district_code: e.target.value })}
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={currentLedger.postal_code}
                onChange={(e) => setCurrentLedger({ ...currentLedger, postal_code: e.target.value })}
                fullWidth
              />
              <TextField
                label="GSTIN"
                value={currentLedger.gstin}
                onChange={(e) => setCurrentLedger({ ...currentLedger, gstin: e.target.value })}
                fullWidth
              />
              <TextField
                label="PAN"
                value={currentLedger.pan}
                onChange={(e) => setCurrentLedger({ ...currentLedger, pan: e.target.value })}
                fullWidth
              />
              <TextField
                label="Contact Person"
                value={currentLedger.contact_person}
                onChange={(e) => setCurrentLedger({ ...currentLedger, contact_person: e.target.value })}
                fullWidth
              />
              <TextField
                label="Mobile Number"
                value={currentLedger.mobile_number}
                onChange={(e) => setCurrentLedger({ ...currentLedger, mobile_number: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={currentLedger.email}
                onChange={(e) => setCurrentLedger({ ...currentLedger, email: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5, borderTop: '1px solid #e0e0e0' }}>
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

export default Ledger;
