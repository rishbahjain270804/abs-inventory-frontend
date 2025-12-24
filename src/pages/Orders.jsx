import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import OrderDetailsModal from '../components/OrderDetailsModal';
import PaymentModal from '../components/PaymentModal';

const API_BASE = '/api';

function Orders() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterParty, setFilterParty] = useState('All Parties');
  const [filterItem, setFilterItem] = useState('All Items');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All Payment Status');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('All Payment Methods');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchLedgers();
    fetchItems();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Use new endpoint that includes item count
      const { data } = await axios.get(`${API_BASE}/orders/with-items/all`);
      setOrders(Array.isArray(data) ? data : []);
      setFilteredOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/ledgers`);
      setLedgers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/items`);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleEdit = (order) => {
    // Navigate to the edit page instead of opening modal
    navigate(`/orders/edit/${order.id}`);
  };



  const handleDelete = async (id) => {
    if (window.confirm('Delete this order and all its items?')) {
      try {
        // Use bulk delete API which cascades to order_items
        await axios.delete(`${API_BASE}/orders/bulk/${id}`);
        showNotification('Order deleted successfully', 'success');
        fetchOrders();
      } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete order', 'error');
      }
    }
  };



  useEffect(() => {
    let result = [...orders];

    if (searchQuery) {
      result = result.filter(order =>
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.party_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'All Status') {
      result = result.filter(order => order.status === filterStatus);
    }

    if (filterParty !== 'All Parties') {
      result = result.filter(order => order.ledger_id === parseInt(filterParty));
    }

    if (filterItem !== 'All Items') {
      result = result.filter(order => order.item_id === parseInt(filterItem));
    }

    if (filterPaymentStatus !== 'All Payment Status') {
      result = result.filter(order => order.payment_status === filterPaymentStatus);
    }

    if (filterPaymentMethod !== 'All Payment Methods') {
      result = result.filter(order => order.payment_method === filterPaymentMethod);
    }

    if (filterDateFrom) {
      result = result.filter(order => new Date(order.order_date) >= new Date(filterDateFrom));
    }

    if (filterDateTo) {
      result = result.filter(order => new Date(order.order_date) <= new Date(filterDateTo));
    }

    setFilteredOrders(result);
  }, [searchQuery, filterStatus, filterParty, filterItem, filterPaymentStatus, filterPaymentMethod, filterDateFrom, filterDateTo, orders]);

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

  const getPartyName = (ledgerId) => {
    const ledger = ledgers.find(l => l.id === ledgerId);
    return ledger ? ledger.party_name : `Party ${ledgerId}`;
  };

  const getItemName = (order) => {
    if (order.items_count > 1) {
      return `${order.items_count} Items`;
    }
    if (order.item_id) {
      const item = items.find(i => i.id === order.item_id);
      return item ? item.item_name : `Item ${order.item_id}`;
    }
    return order.items_count === 1 ? '1 Item' : '-';
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: isMobile ? 10 : 4 }}>
      {/* Page Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', py: 2, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" color="#333" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Orders
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/orders/create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              flex: isMobile ? '1 1 auto' : '0 0 auto',
            }}
          >
            Add Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
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
          placeholder="Search orders"
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
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Dispatched">Dispatched</MenuItem>
          </TextField>

          <TextField
            select
            label="Party"
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            sx={{ minWidth: 200, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Parties">All Parties</MenuItem>
            {ledgers.map(ledger => (
              <MenuItem key={ledger._id} value={ledger._id}>{ledger.party_name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Item"
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            sx={{ minWidth: 200, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Items">All Items</MenuItem>
            {items.map(item => (
              <MenuItem key={item._id} value={item._id}>{item.item_name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Payment Status"
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            sx={{ minWidth: 180, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Payment Status">All Payment Status</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
            <MenuItem value="Partial">Partial</MenuItem>
          </TextField>

          <TextField
            select
            label="Payment Method"
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            sx={{ minWidth: 180, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
          >
            <MenuItem value="All Payment Methods">All Payment Methods</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            <MenuItem value="Cheque">Cheque</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
          </TextField>

          <TextField
            type="date"
            label="From Date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            sx={{ minWidth: 160, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            type="date"
            label="To Date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            sx={{ minWidth: 160, bgcolor: 'white', flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="outlined"
            onClick={() => {
              setFilterStatus('All Status');
              setFilterParty('All Parties');
              setFilterItem('All Items');
              setFilterPaymentStatus('All Payment Status');
              setFilterPaymentMethod('All Payment Methods');
              setFilterDateFrom('');
              setFilterDateTo('');
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

        {/* Order Cards - Mobile | Table - Desktop */}
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loading ? (
              <Typography sx={{ textAlign: 'center', py: 4 }}>Loading...</Typography>
            ) : filteredOrders.length === 0 ? (
              <Typography sx={{ textAlign: 'center', py: 4, color: '#999' }}>No orders found</Typography>
            ) : (
              filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShowDetailsModal(true);
                  }}
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
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
                          {order.order_number || `ORD-${String(order.id).padStart(3, '0')}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status}
                        size="small"
                        sx={{
                          bgcolor: order.status === 'Pending' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                          color: order.status === 'Pending' ? '#ff9800' : '#4caf50',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {order.party_name || getPartyName(order.ledger_id)}
                    </Typography>
                    <Box sx={{ mb: 0.5 }}>
                      {order.items_count > 1 ? (
                        <Chip 
                          label={`${order.items_count} items`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {`${getItemName(order.item_id)} - Qty: ${order.quantity || '-'}`}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                      ₹{order.total_amount?.toLocaleString() || '0'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                          setShowDetailsModal(true);
                        }}
                        sx={{
                          bgcolor: '#667eea',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(order);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id);
                        }}
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
                    <th style={tableHeaderStyle}>Order</th>
                    <th style={tableHeaderStyle}>Party</th>
                    <th style={tableHeaderStyle}>Item</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Qty</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Amount</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Payment</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Status</th>
                    <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>Loading...</td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No orders found</td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => (
                      <tr 
                        key={order.id}
                        style={{ ...tableRowStyle(index), cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowDetailsModal(true);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef1f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9fafb'}
                      >
                        <td style={{ ...tableCellStyle(), fontWeight: 700 }}>
                          {order.order_number || `ORD-${String(order.id).padStart(3, '0')}`}
                        </td>
                        <td style={tableCellStyle()}>{order.party_name || getPartyName(order.ledger_id)}</td>
                        <td style={tableCellStyle()}>
                          {order.items_count > 1 ? (
                            <Chip 
                              label={`${order.items_count} items`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ cursor: 'pointer' }}
                            />
                          ) : order.items_count === 1 ? (
                            'View Details'
                          ) : (
                            getItemName(order.item_id)
                          )}
                        </td>
                        <td style={{ ...tableCellStyle('right') }}>{order.quantity || '-'}</td>
                        <td style={{ ...tableCellStyle('right'), fontWeight: 700 }}>
                          ₹{order.total_amount?.toLocaleString() || '0'}
                        </td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <Chip
                            label={order.payment_status || 'Unpaid'}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderForPayment(order);
                              setShowPaymentModal(true);
                            }}
                            sx={{
                              bgcolor: order.payment_status === 'Paid' ? '#d4edda' : order.payment_status === 'Partial' ? '#fff3cd' : '#f8d7da',
                              color: order.payment_status === 'Paid' ? '#155724' : order.payment_status === 'Partial' ? '#856404' : '#721c24',
                              fontWeight: 700,
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                          />
                        </td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: 999,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              backgroundColor: order.status === 'Pending' ? 'rgba(255, 152, 0, 0.12)' : 'rgba(76, 175, 80, 0.12)',
                              color: order.status === 'Pending' ? '#e0a100' : '#0f9a73',
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle('center') }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(order);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order.id);
                            }}
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
          onClick={() => navigate('/orders/create')}
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


      {/* Order Details Modal */}
      <OrderDetailsModal 
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onOpenPaymentModal={(order) => {
          setShowDetailsModal(false);
          setSelectedOrderForPayment(order);
          setShowPaymentModal(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOrderForPayment(null);
        }}
        order={selectedOrderForPayment}
        onPaymentUpdate={() => {
          fetchOrders();
          showNotification('Payment updated successfully', 'success');
        }}
      />
    </Box>
  );
}

export default Orders;
