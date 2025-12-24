import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  Autocomplete,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add,
  Delete,
  ExpandMore,
  ExpandLess,
  Save,
  ArrowBack,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNotification } from '../components/Notification';

const API_BASE = '/api';

function EditOrder() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Loading state
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Order Header State
  const [orderHeader, setOrderHeader] = useState({
    party_name: '',
    ledger_id: '',
    order_number: '',
    order_date: '',
    delivery_date: '',
    status: 'Pending',
    payment_method: 'Pending',
    payment_status: 'Unpaid',
    paid_amount: 0,
    balance_due: 0,
    remarks: '',
  });

  // Order Items State
  const [orderItems, setOrderItems] = useState([]);

  // Data from API
  const [ledgers, setLedgers] = useState([]);
  const [items, setItems] = useState([]);

  // Expanded items for mobile view
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchLedgers();
    fetchItems();
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setInitialLoading(true);
      const { data } = await axios.get(`${API_BASE}/orders/with-items/${id}`);
      if (data.success && data.data) {
        const order = data.data;
        setOrderHeader({
          party_name: order.party_name || '',
          ledger_id: order.ledger_id,
          order_number: order.order_number,
          order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : '',
          delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : '',
          status: order.status || 'Pending',
          payment_method: order.payment_method || 'Pending',
          payment_status: order.payment_status || 'Unpaid',
          paid_amount: order.paid_amount || 0,
          balance_due: order.balance_due || 0,
          remarks: order.remarks || '',
        });

        // Map order items
        if (order.items && order.items.length > 0) {
          const mappedItems = order.items.map((item, idx) => ({
            id: idx + 1,
            item_id: item.item_id,
            item_name: item.item_name || '',
            item_code: item.item_code || '',
            hsn_code: item.hsn_code || '',
            gst_rate: item.gst_rate || '',
            qty_mt: item.qty_mt || '',
            qty_pcs: item.qty_pcs || '',
            rate: item.rate || '',
            amount: item.amount || 0,
            expanded: true,
          }));
          setOrderItems(mappedItems);
          // Set all items as expanded
          const expanded = {};
          mappedItems.forEach(item => { expanded[item.id] = true; });
          setExpandedItems(expanded);
        } else {
          setOrderItems([createEmptyItem(1)]);
          setExpandedItems({ 1: true });
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      showNotification('Failed to load order details', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  const createEmptyItem = (id) => ({
    id,
    item_id: '',
    item_name: '',
    item_code: '',
    hsn_code: '',
    gst_rate: '',
    qty_mt: '',
    qty_pcs: '',
    rate: '',
    amount: 0,
    expanded: true,
  });

  const fetchLedgers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/ledgers`);
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/items`);
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handlePartySelect = (event, newValue) => {
    if (newValue) {
      setOrderHeader(prev => ({
        ...prev,
        party_name: newValue.party_name,
        ledger_id: newValue.id
      }));
    } else {
      setOrderHeader(prev => ({
        ...prev,
        party_name: '',
        ledger_id: ''
      }));
    }
  };

  const handleItemSelect = (index, selectedItem) => {
    if (selectedItem) {
      const updatedItems = [...orderItems];
      updatedItems[index] = {
        ...updatedItems[index],
        item_id: selectedItem.id,
        item_name: selectedItem.item_name,
        item_code: selectedItem.item_code || '',
        hsn_code: selectedItem.hsn_code || '',
        gst_rate: selectedItem.gst_rate || '',
        rate: selectedItem.opening_value || updatedItems[index].rate,
      };
      updatedItems[index].amount = calculateAmount(updatedItems[index]);
      setOrderItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index][field] = value;
    if (['qty_mt', 'qty_pcs', 'rate'].includes(field)) {
      updatedItems[index].amount = calculateAmount(updatedItems[index]);
    }
    setOrderItems(updatedItems);
  };

  const calculateAmount = (item) => {
    const qtyMt = parseFloat(item.qty_mt) || 0;
    const qtyPcs = parseFloat(item.qty_pcs) || 0;
    const rate = parseFloat(item.rate) || 0;
    const totalQty = qtyMt > 0 ? qtyMt : qtyPcs;
    return (totalQty * rate).toFixed(2);
  };

  const addNewItem = () => {
    const newId = Math.max(...orderItems.map(i => i.id), 0) + 1;
    setOrderItems([...orderItems, createEmptyItem(newId)]);
    setExpandedItems(prev => ({ ...prev, [newId]: true }));
  };

  const removeItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + parseFloat(item.amount || 0), 0).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!orderHeader.ledger_id) {
      showNotification('Please select a party', 'error');
      return;
    }

    if (!orderHeader.order_number) {
      showNotification('Order number is required', 'error');
      return;
    }

    const validItems = orderItems.filter(item => item.item_id && (item.qty_mt || item.qty_pcs));
    if (validItems.length === 0) {
      showNotification('Please add at least one item with quantity', 'error');
      return;
    }

    setSaving(true);

    try {
      const orderData = {
        order_header: {
          order_number: orderHeader.order_number,
          ledger_id: orderHeader.ledger_id,
          order_date: orderHeader.order_date,
          delivery_date: orderHeader.delivery_date || null,
          status: orderHeader.status,
          payment_method: orderHeader.payment_method,
          payment_status: orderHeader.payment_status,
          paid_amount: orderHeader.paid_amount,
          balance_due: orderHeader.balance_due,
          remarks: orderHeader.remarks,
        },
        order_items: validItems.map(item => ({
          item_id: item.item_id,
          qty_mt: parseFloat(item.qty_mt) || 0,
          qty_pcs: parseInt(item.qty_pcs) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        }))
      };

      const response = await axios.put(`${API_BASE}/orders/bulk/${id}`, orderData);

      if (response.data.success) {
        showNotification(`Order ${orderHeader.order_number} updated successfully!`, 'success');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showNotification(
        error.response?.data?.message || 'Failed to update order',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/orders')} sx={{ bgcolor: 'white', boxShadow: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            Edit Order
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={orderHeader.order_number} color="primary" size="small" />
            <Chip 
              label={orderHeader.status} 
              size="small"
              sx={{ 
                bgcolor: orderHeader.status === 'Pending' ? '#fff3cd' : '#d1ecf1',
                color: orderHeader.status === 'Pending' ? '#856404' : '#0c5460'
              }} 
            />
          </Box>
        </Box>
      </Box>

      {/* Order Header Card */}
      <Card sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Order Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {/* Party Name */}
            <Autocomplete
              options={ledgers}
              getOptionLabel={(option) => option.party_name || ''}
              value={ledgers.find(l => l.id === orderHeader.ledger_id) || null}
              onChange={handlePartySelect}
              renderInput={(params) => (
                <TextField {...params} label="Party Name" required size="small" />
              )}
            />

            {/* Order No */}
            <TextField
              label="Order No"
              value={orderHeader.order_number}
              onChange={(e) => setOrderHeader(prev => ({ ...prev, order_number: e.target.value }))}
              size="small"
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: '#f9f9f9' }}
            />

            {/* Order Date */}
            <TextField
              label="Order Date"
              type="date"
              value={orderHeader.order_date}
              onChange={(e) => setOrderHeader(prev => ({ ...prev, order_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {/* Delivery Date */}
            <TextField
              label="Delivery Date"
              type="date"
              value={orderHeader.delivery_date}
              onChange={(e) => setOrderHeader(prev => ({ ...prev, delivery_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              value={orderHeader.status}
              onChange={(e) => setOrderHeader(prev => ({ ...prev, status: e.target.value }))}
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="Pending">Pending</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </TextField>

            {/* Remarks */}
            <TextField
              label="Remarks"
              value={orderHeader.remarks}
              onChange={(e) => setOrderHeader(prev => ({ ...prev, remarks: e.target.value }))}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Items Table Card */}
      <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Order Items ({orderItems.length})
            </Typography>
            <Button startIcon={<Add />} onClick={addNewItem} sx={{ textTransform: 'none' }}>
              Add Item
            </Button>
          </Box>

          {/* Desktop Table Header */}
          {!isMobile && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1fr 1fr 1fr 1.2fr 0.5fr',
                gap: 1,
                p: 2,
                backgroundColor: '#e9e9e9',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <Box>Item Name</Box>
              <Box>Item Code</Box>
              <Box>HSN Code</Box>
              <Box>GST</Box>
              <Box sx={{ textAlign: 'center' }}>MT Qty</Box>
              <Box sx={{ textAlign: 'center' }}>PCS Qty</Box>
              <Box sx={{ textAlign: 'right' }}>Rate</Box>
              <Box sx={{ textAlign: 'right' }}>Amount</Box>
              <Box></Box>
            </Box>
          )}

          {/* Items */}
          {orderItems.map((item, index) => (
            isMobile ? (
              // Mobile Card View
              <Card key={item.id} sx={{ m: 2, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <Box
                  onClick={() => toggleItemExpand(item.id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: '#f8f9fa',
                    cursor: 'pointer',
                  }}
                >
                  <Typography fontWeight={600}>
                    {item.item_name || `Item ${index + 1}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.amount > 0 && (
                      <Typography fontWeight={600} color="primary">₹{item.amount}</Typography>
                    )}
                    {expandedItems[item.id] ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>
                <Collapse in={expandedItems[item.id]}>
                  <CardContent sx={{ p: 2 }}>
                    <Autocomplete
                      size="small"
                      options={items}
                      getOptionLabel={(option) => option.item_name || ''}
                      value={items.find(i => i.id === item.item_id) || null}
                      onChange={(e, newValue) => handleItemSelect(index, newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="Item" sx={{ mb: 2 }} />
                      )}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <TextField size="small" label="MT Qty" type="number" value={item.qty_mt} 
                        onChange={(e) => handleItemChange(index, 'qty_mt', e.target.value)} />
                      <TextField size="small" label="PCS Qty" type="number" value={item.qty_pcs} 
                        onChange={(e) => handleItemChange(index, 'qty_pcs', e.target.value)} />
                      <TextField size="small" label="Rate" type="number" value={item.rate} 
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)} />
                      <TextField size="small" label="Amount" value={`₹${item.amount}`} InputProps={{ readOnly: true }} 
                        sx={{ bgcolor: '#f9f9f9' }} />
                    </Box>
                    {orderItems.length > 1 && (
                      <Button size="small" color="error" startIcon={<Delete />} onClick={() => removeItem(index)}>
                        Remove
                      </Button>
                    )}
                  </CardContent>
                </Collapse>
              </Card>
            ) : (
              // Desktop Table Row
              <Box
                key={item.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 0.8fr 1fr 1fr 1fr 1.2fr 0.5fr',
                  gap: 1,
                  p: 2,
                  alignItems: 'center',
                  borderBottom: '1px solid #e8e8e8',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa',
                }}
              >
                <Autocomplete
                  size="small"
                  options={items}
                  getOptionLabel={(option) => option.item_name || ''}
                  value={items.find(i => i.id === item.item_id) || null}
                  onChange={(e, newValue) => handleItemSelect(index, newValue)}
                  renderInput={(params) => <TextField {...params} placeholder="Select Item" size="small" />}
                />
                <TextField size="small" value={item.item_code} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f9f9f9' }} />
                <TextField size="small" value={item.hsn_code} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f9f9f9' }} />
                <TextField size="small" value={item.gst_rate ? `${item.gst_rate}%` : ''} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f9f9f9' }} />
                <TextField size="small" type="number" value={item.qty_mt} onChange={(e) => handleItemChange(index, 'qty_mt', e.target.value)} placeholder="0" inputProps={{ style: { textAlign: 'center' } }} />
                <TextField size="small" type="number" value={item.qty_pcs} onChange={(e) => handleItemChange(index, 'qty_pcs', e.target.value)} placeholder="0" inputProps={{ style: { textAlign: 'center' } }} />
                <TextField size="small" type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} inputProps={{ style: { textAlign: 'right' } }} />
                <TextField size="small" value={`₹${item.amount}`} InputProps={{ readOnly: true }} sx={{ bgcolor: '#f9f9f9', '& input': { textAlign: 'right', fontWeight: 600 } }} />
                <IconButton onClick={() => removeItem(index)} disabled={orderItems.length === 1} sx={{ color: '#dc3545' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )
          ))}

          {/* Total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              p: 2,
              backgroundColor: '#f5f5f5',
              borderTop: '2px solid #e0e0e0',
            }}
          >
            <Typography variant="h6" sx={{ mr: 2, fontWeight: 600 }}>Total:</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>₹{calculateTotal()}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ borderColor: '#666', color: '#666', textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textTransform: 'none',
            px: 4,
          }}
        >
          {saving ? 'Saving...' : 'Update Order'}
        </Button>
      </Box>
    </Box>
  );
}

export default EditOrder;
