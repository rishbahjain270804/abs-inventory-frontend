import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Grid
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  LocalShipping,
  Receipt,
  Inventory,
  People,
  Assessment,
  ArrowForward,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [stats, setStats] = useState({
    revenue: 0,
    collectedRevenue: 0,
    outstandingBalance: 0,
    pendingOrders: 0,
    totalOrders: 0,
    totalDispatched: 0,
    totalItems: 0,
    totalLedgers: 0,
  });
  
  const [orders, setOrders] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [salesByState, setSalesByState] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, ledgersRes, itemsRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/ledgers'),
        axios.get('/api/items'),
      ]);

      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const ledgersData = Array.isArray(ledgersRes.data) ? ledgersRes.data : [];
      const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : [];

      setOrders(ordersData);
      setLedgers(ledgersData);
      setItems(itemsData);

      // Calculate revenue metrics
      const totalRevenue = (ordersData || []).reduce((sum, order) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );
      
      // Collected Revenue = Sum of paid_amount for Paid orders
      const collectedRevenue = (ordersData || [])
        .filter(o => o.payment_status === 'Paid')
        .reduce((sum, order) => sum + (parseFloat(order.paid_amount) || 0), 0);
      
      // Outstanding Balance = Sum of balance_due for Unpaid/Partial orders
      const outstandingBalance = (ordersData || [])
        .filter(o => o.payment_status !== 'Paid' || o.payment_status === 'Partial')
        .reduce((sum, order) => sum + (parseFloat(order.balance_due) || 0), 0);
      
      const pending = ordersData.filter(o => o.status === 'Pending').length;
      const dispatched = ordersData.filter(o => o.status === 'Dispatched').length;

      setStats({
        revenue: totalRevenue,
        collectedRevenue: collectedRevenue,
        outstandingBalance: outstandingBalance,
        pendingOrders: pending,
        totalOrders: ordersData.length,
        totalDispatched: dispatched,
        totalItems: itemsData.length,
        totalLedgers: ledgersData.length,
      });

      setDailyTrends(processDailyTrends(ordersData));
      setStatusBreakdown(processStatusBreakdown(ordersData));
      setSalesByState(processSalesByState(ordersData, ledgersData));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const processDailyTrends = (ordersData) => {
    const days = 30;
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = ordersData.filter(order => {
        if (!order.order_date) return false;
        const orderDate = new Date(order.order_date).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      const dayRevenue = dayOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total_amount) || 0), 0
      );

      trends.push({
        day: date.getDate(),
        orderCount: dayOrders.length,
        revenue: dayRevenue,
      });
    }

    return trends;
  };

  const processStatusBreakdown = (ordersData) => {
    const completed = ordersData.filter(o => o.status === 'Dispatched').length;
    const pending = ordersData.filter(o => o.status === 'Pending').length;
    const cancelled = Math.floor(ordersData.length * 0.1);

    return [
      { name: 'Completed', value: completed, color: '#3D9970' },
      { name: 'Pending', value: pending, color: '#E07A5F' },
      { name: 'Cancelled', value: cancelled, color: '#81667A' },
    ];
  };

  const processSalesByState = (ordersData, ledgersData) => {
    const ledgerMap = {};
    ledgersData.forEach(ledger => {
      ledgerMap[ledger.id] = ledger;
    });

    const stateMap = {};
    ordersData.forEach(order => {
      const ledger = ledgerMap[order.ledger_id];
      if (ledger && ledger.state) {
        const state = ledger.state;
        stateMap[state] = (stateMap[state] || 0) + (parseFloat(order.total_amount) || 0);
      }
    });

    const salesArray = Object.entries(stateMap)
      .map(([state, amount]) => ({ state, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return salesArray;
  };

  const StatCard = ({ icon: Icon, title, value, colorClass, trend, onClick }) => {
    const getCardColors = () => {
      switch(colorClass) {
        case 'stat-card-purple':
          return { bg: '#5B7FDB', icon: '#4A63B8' };
        case 'stat-card-orange':
          return { bg: '#E07A5F', icon: '#C96A53' };
        case 'stat-card-green':
          return { bg: '#3D9970', icon: '#2E7659' };
        default:
          return { bg: '#6B9080', icon: '#557566' };
      }
    };
    const colors = getCardColors();
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          bgcolor: colors.bg,
          color: 'white',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          } : {}
        }}
        onClick={onClick}
      >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ 
            bgcolor: colors.icon, 
            borderRadius: 2, 
            p: 1.5, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          {trend && (
            <Chip 
              label={trend} 
              size="small" 
              sx={{ 
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }} 
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
          {typeof value === 'number' && title.includes('Revenue') 
            ? `₹${value.toLocaleString()}`
            : value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, path, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .action-icon': {
            bgcolor: color,
            color: 'white'
          }
        }
      }}
      onClick={() => navigate(path)}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
        <Box 
          className="action-icon"
          sx={{ 
            bgcolor: alpha(color, 0.1), 
            color: color,
            borderRadius: 2, 
            p: 2, 
            display: 'flex',
            transition: 'all 0.3s'
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <ArrowForward sx={{ color: 'text.secondary' }} />
      </CardContent>
    </Card>
  );

  const ChartCard = ({ title, children }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ height: 400, width: '100%', mt: 1 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );

  const RecentOrdersTable = ({ title, data, maxRows = 5 }) => {
    const getStatusColor = (status) => {
      if (status === 'Pending') return 'warning';
      if (status === 'Dispatched') return 'success';
      return 'default';
    };

    const getLedgerName = (ledgerId) => {
      const ledger = ledgers.find(l => l.id === ledgerId);
      return ledger ? ledger.party_name : `Ledger ${ledgerId}`;
    };

    const getItemName = (order) => {
      // If we have items_count available (from bulk order controller)
      if (order.items_count && order.items_count > 1) {
        return `${order.items_count} Items`;
      }
      
      // If we have a single item_id
      if (order.item_id) {
        const item = items.find(i => i.id === order.item_id);
        return item ? item.item_name : `Item ${order.item_id}`;
      }
      
      // Fallback if no item info
      return order.items_count === 1 ? '1 Item' : '-';
    };

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Button 
              size="small" 
              endIcon={<ArrowForward />}
              onClick={() => navigate('/orders')}
            >
              View All
            </Button>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>Order #</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>Party</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>Item</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>Amount</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: '#333' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, maxRows).map((order, index) => (
                  <tr key={order.id || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 8px', fontSize: '0.875rem', fontWeight: 500 }}>
                      {order.order_number || `ORD-${order.id}`}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>
                      {getLedgerName(order.ledger_id)}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>
                      {getItemName(order)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>
                      ₹{parseFloat(order.total_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      />
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Typography variant="h6" color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box sx={{ pt: 4, pb: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Dashboard
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Welcome to ABS Inventory Management System. Monitor your business operations at a glance.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
          }}
        >
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={stats.revenue}
            colorClass="stat-card-purple"
            trend="+12.5%"
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon={Receipt}
            title="Collected Revenue"
            value={stats.collectedRevenue}
            colorClass="stat-card-green"
            trend="Paid"
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon={Assessment}
            title="Outstanding Balance"
            value={stats.outstandingBalance}
            colorClass="stat-card-orange"
            trend="Unpaid"
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            colorClass="stat-card-violet"
            trend="+8.2%"
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon={LocalShipping}
            title="Pending Orders"
            value={stats.pendingOrders}
            colorClass="stat-card-orange"
            trend={`${stats.pendingOrders}`}
            onClick={() => navigate('/orders')}
          />
          <StatCard
            icon={LocalShipping}
            title="Dispatched Orders"
            value={stats.totalDispatched}
            colorClass="stat-card-green"
            trend={`${stats.totalDispatched}`}
          />
          <StatCard
            icon={Inventory}
            title="Total Items"
            value={stats.totalItems}
            colorClass="stat-card-violet"
            onClick={() => navigate('/item')}
          />
          <StatCard
            icon={People}
            title="Total Parties"
            value={stats.totalLedgers}
            colorClass="stat-card-purple"
            onClick={() => navigate('/ledger')}
          />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <QuickActionCard
                icon={ShoppingCart}
                title="Create Order"
                description="Add new orders to the system"
                path="/orders"
                color="#5B7FDB"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <QuickActionCard
                icon={People}
                title="Manage Ledgers"
                description="View and manage party details"
                path="/ledger"
                color="#E07A5F"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <QuickActionCard
                icon={Inventory}
                title="Manage Items"
                description="Update inventory items"
                path="/item"
                color="#3D9970"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Recent Orders Tables */}
        {orders.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                Recent Activity
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                <Grid size={{ xs: 12, lg: 6 }}>
                  <RecentOrdersTable 
                    title="Pending Orders" 
                    data={orders.filter(o => o.status === 'Pending')}
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <RecentOrdersTable 
                    title="Recent Dispatches" 
                    data={orders.filter(o => o.status === 'Dispatched')}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;
