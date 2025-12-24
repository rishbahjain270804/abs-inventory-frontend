import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close,
  Payment as PaymentIcon,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const API_BASE = '/api';

function PaymentModal({ open, onClose, order, onPaymentUpdate }) {
  const [paymentData, setPaymentData] = useState({
    payment_status: 'Unpaid',
    payment_method: 'Cash',
    paid_amount: 0,
    balance_due: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      // Normalize payment_method: If it's 'Pending' or not in valid list, default to 'Cash'
      const validMethods = ['Cash', 'Online', 'Cheque', 'COD', 'Credit'];
      const paymentMethod = validMethods.includes(order.payment_method) 
        ? order.payment_method 
        : 'Cash';
      
      setPaymentData({
        payment_status: order.payment_status || 'Unpaid',
        payment_method: paymentMethod,
        paid_amount: parseFloat(order.paid_amount || 0),
        balance_due: parseFloat(order.balance_due || order.total_amount || 0),
      });
    }
  }, [order]);

  const handlePaidAmountChange = (value) => {
    const paidAmount = parseFloat(value) || 0;
    const totalAmount = parseFloat(order?.total_amount || 0);
    const balanceDue = totalAmount - paidAmount;

    let paymentStatus = 'Unpaid';
    if (paidAmount >= totalAmount) {
      paymentStatus = 'Paid';
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
      paymentStatus = 'Partial';
    }

    setPaymentData({
      ...paymentData,
      paid_amount: paidAmount,
      balance_due: Math.max(0, balanceDue),
      payment_status: paymentStatus,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.patch(`${API_BASE}/orders/${order.id}/payment`, paymentData);
      onPaymentUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return { bg: '#d4edda', color: '#155724' };
      case 'Unpaid': return { bg: '#f8d7da', color: '#721c24' };
      case 'Partial': return { bg: '#fff3cd', color: '#856404' };
      default: return { bg: '#e7e7e7', color: '#333' };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#667eea',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          <Typography variant="h6">Payment Management</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Order Information */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Order Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {order?.order_number}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 0 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  ₹{parseFloat(order?.total_amount || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Current Status
                </Typography>
                <Chip 
                  label={order?.payment_status || 'Unpaid'}
                  sx={{
                    bgcolor: getPaymentStatusColor(order?.payment_status).bg,
                    color: getPaymentStatusColor(order?.payment_status).color,
                    fontWeight: 700,
                    mt: 0.5
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Payment Details Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                select
                label="Payment Method"
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Online">Online (UPI/Bank Transfer)</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="COD">Cash on Delivery</MenuItem>
                <MenuItem value="Credit">Credit</MenuItem>
              </TextField>
            </Box>

            <Box>
              <TextField
                label="Paid Amount"
                type="number"
                value={paymentData.paid_amount}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 0, max: order?.total_amount, step: 0.01 }}
                helperText={`Total: ₹${parseFloat(order?.total_amount || 0).toLocaleString()}`}
              />
            </Box>

            <Box>
              <TextField
                label="Balance Due"
                type="number"
                value={paymentData.balance_due}
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                  sx: { 
                    bgcolor: '#f8f9fa',
                    fontWeight: 700,
                    color: paymentData.balance_due > 0 ? '#dc3545' : '#28a745'
                  }
                }}
              />
            </Box>

            <Box>
              <TextField
                select
                label="Payment Status"
                value={paymentData.payment_status}
                fullWidth
                disabled
                InputProps={{
                  readOnly: true,
                  sx: { bgcolor: '#f8f9fa' }
                }}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </TextField>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Status is automatically calculated based on paid amount
              </Typography>
            </Box>
          </Box>

          {/* Payment Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '2px solid #667eea' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  Total Amount:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  ₹{parseFloat(order?.total_amount || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  Paid Amount:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#28a745' }}>
                  ₹{paymentData.paid_amount.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Divider sx={{ my: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  Balance Due:
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: paymentData.balance_due > 0 ? '#dc3545' : '#28a745' 
                }}>
                  ₹{paymentData.balance_due.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handlePaidAmountChange(order?.total_amount)}
              startIcon={<CheckCircle />}
              sx={{ textTransform: 'none' }}
            >
              Mark as Fully Paid
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handlePaidAmountChange(0)}
              startIcon={<Warning />}
              sx={{ textTransform: 'none' }}
            >
              Reset to Unpaid
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5568d3' }
            }}
          >
            {loading ? 'Updating...' : 'Update Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PaymentModal;
