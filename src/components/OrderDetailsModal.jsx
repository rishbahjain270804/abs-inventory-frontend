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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Print,
  Email,
  LocalShipping,
  Payment,
  Person,
  CalendarToday,
  Receipt,
} from '@mui/icons-material';

const API_BASE = '/api';

function OrderDetailsModal({ open, onClose, orderId, onOpenPaymentModal }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/orders/with-items/${orderId}`);
      if (data.success) {
        setOrderDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fff3cd', color: '#856404' };
      case 'Dispatched': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'Delivered': return { bg: '#d4edda', color: '#155724' };
      case 'Cancelled': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#e7e7e7', color: '#333' };
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

  if (!orderDetails && !loading) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#667eea',
        color: 'white',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          <Typography variant="h6">Order Details</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Order Header Info */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Order Number
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                  {orderDetails.order_number}
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                  Order Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: '#666' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(orderDetails.order_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Party Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Party Information
              </Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                  {orderDetails.party_name}
                </Typography>
                {orderDetails.address && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    📍 {orderDetails.address}
                  </Typography>
                )}
                {orderDetails.mobile_number && (
                  <Typography variant="body2" color="textSecondary">
                    📱 {orderDetails.mobile_number}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Order Items */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Order Items ({orderDetails.items?.length || 0})
              </Typography>
              
              {isMobile ? (
                // Mobile Card View
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {orderDetails.items?.map((item, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        p: 2, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        bgcolor: 'white'
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                        {item.item_name}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">Item Code</Typography>
                          <Typography variant="body2">{item.item_code || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">HSN Code</Typography>
                          <Typography variant="body2">{item.hsn_code || '-'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">MT Qty</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.qty_mt || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">PCS Qty</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.qty_pcs || 0}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{parseFloat(item.rate || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="textSecondary">Amount</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#667eea' }}>
                            ₹{parseFloat(item.amount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                // Desktop Table View
                <Table sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Item Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>HSN Code</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>MT Qty</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>PCS Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.items?.map((item, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{item.item_name}</TableCell>
                        <TableCell>{item.item_code || '-'}</TableCell>
                        <TableCell>{item.hsn_code || '-'}</TableCell>
                        <TableCell align="center">{item.qty_mt || 0}</TableCell>
                        <TableCell align="center">{item.qty_pcs || 0}</TableCell>
                        <TableCell align="right">₹{parseFloat(item.rate || 0).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#667eea' }}>
                          ₹{parseFloat(item.amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>

            {/* Order Summary */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 2,
              border: '2px solid #667eea',
              mb: 3
            }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShipping sx={{ fontSize: 20, color: '#666' }} />
                    <Typography variant="body2" color="textSecondary">Order Status</Typography>
                  </Box>
                  <Chip 
                    label={orderDetails.status}
                    sx={{
                      bgcolor: getStatusColor(orderDetails.status).bg,
                      color: getStatusColor(orderDetails.status).color,
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Payment sx={{ fontSize: 20, color: '#666' }} />
                    <Typography variant="body2" color="textSecondary">Payment Status</Typography>
                  </Box>
                  <Chip 
                    label={orderDetails.payment_status}
                    sx={{
                      bgcolor: getPaymentStatusColor(orderDetails.payment_status).bg,
                      color: getPaymentStatusColor(orderDetails.payment_status).color,
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 1 }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Payment Method</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {orderDetails.payment_method || 'Pending'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                    ₹{parseFloat(orderDetails.total_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
                {orderDetails.paid_amount > 0 && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Paid Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#28a745' }}>
                      ₹{parseFloat(orderDetails.paid_amount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {orderDetails.balance_due > 0 && (
                  <Box>
                    <Typography variant="body2" color="textSecondary">Balance Due</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#dc3545' }}>
                      ₹{parseFloat(orderDetails.balance_due || 0).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Remarks */}
            {orderDetails.remarks && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Remarks
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ 
                  p: 2, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 1,
                  fontStyle: 'italic'
                }}>
                  {orderDetails.remarks}
                </Typography>
              </Box>
            )}

            {/* Footer Info */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="textSecondary">
                Created on: {new Date(orderDetails.created_at).toLocaleString('en-IN')}
              </Typography>
              {orderDetails.created_by_name && (
                <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                  Created by: {orderDetails.created_by_name}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', gap: 1 }}>
        <Button
          startIcon={<Payment />}
          variant="contained"
          onClick={() => {
            if (onOpenPaymentModal) {
              onOpenPaymentModal(orderDetails);
            }
          }}
          sx={{
            bgcolor: '#28a745',
            '&:hover': { bgcolor: '#218838' }
          }}
        >
          Update Payment
        </Button>
        <Button
          startIcon={<Print />}
          variant="outlined"
          onClick={() => window.print()}
        >
          Print
        </Button>
        <Button
          startIcon={<Email />}
          variant="outlined"
          onClick={() => alert('Email functionality coming soon')}
        >
          Email
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderDetailsModal;
