import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, ExpandMore } from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', path: '/' },
  { text: 'Ledger', path: '/ledger' },
  { text: 'Item', path: '/item' },
  { text: 'District', path: '/district' },
  { text: 'Orders', path: '/orders' },
];

function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const isMaster = ['/ledger', '/item', '/district'].includes(location.pathname);
  const isTransaction = ['/orders'].includes(location.pathname);
  const [masterAnchorEl, setMasterAnchorEl] = useState(null);
  const [transactionAnchorEl, setTransactionAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [navAnchorEl, setNavAnchorEl] = useState(null);

  const handleOpenNavMenu = (event) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setNavAnchorEl(null);
  };

  return (
    <>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          {/* Mobile Menu */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleOpenNavMenu}
              sx={{ mr: 2, color: '#333' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src="/logo.png"
            alt="ABS Inventory"
            sx={{ height: 32, width: 'auto', mr: 2, display: 'block' }}
          />

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                color="inherit"
                sx={{
                  color: isDashboard ? '#667eea' : '#333',
                  textTransform: 'none',
                  fontWeight: isDashboard ? 700 : 500,
                  backgroundColor: isDashboard ? 'rgba(102,126,234,0.08)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(102,126,234,0.12)' },
                }}
                component={Link}
                to="/"
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                endIcon={<ExpandMore />}
                onClick={(e) => setMasterAnchorEl(e.currentTarget)}
                sx={{
                  color: isMaster ? '#667eea' : '#333',
                  textTransform: 'none',
                  fontWeight: isMaster ? 700 : 500,
                  backgroundColor: isMaster ? 'rgba(102,126,234,0.08)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(102,126,234,0.12)' },
                }}
              >
                Master
              </Button>
              <Menu
                anchorEl={masterAnchorEl}
                open={Boolean(masterAnchorEl)}
                onClose={() => setMasterAnchorEl(null)}
                PaperProps={{
                  sx: {
                    minWidth: 250,
                    mt: 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <MenuItem component={Link} to="/ledger" onClick={() => setMasterAnchorEl(null)}>
                  Ledger
                </MenuItem>
                <MenuItem component={Link} to="/item" onClick={() => setMasterAnchorEl(null)}>
                  Item
                </MenuItem>
                <MenuItem component={Link} to="/district" onClick={() => setMasterAnchorEl(null)}>
                  District
                </MenuItem>
              </Menu>
              <Button
                color="inherit"
                endIcon={<ExpandMore />}
                onClick={(e) => setTransactionAnchorEl(e.currentTarget)}
                sx={{
                  color: isTransaction ? '#667eea' : '#333',
                  textTransform: 'none',
                  fontWeight: isTransaction ? 700 : 500,
                  backgroundColor: isTransaction ? 'rgba(102,126,234,0.08)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(102,126,234,0.12)' },
                }}
              >
                Transaction
              </Button>
              <Menu
                anchorEl={transactionAnchorEl}
                open={Boolean(transactionAnchorEl)}
                onClose={() => setTransactionAnchorEl(null)}
                PaperProps={{
                  sx: {
                    minWidth: 250,
                    mt: 1,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <MenuItem component={Link} to="/orders" onClick={() => setTransactionAnchorEl(null)}>
                  Orders
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Mobile Navigation Menu */}
          {isMobile && (
            <Menu
              anchorEl={navAnchorEl}
              open={Boolean(navAnchorEl)}
              onClose={handleCloseNavMenu}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={handleCloseNavMenu}
                  selected={location.pathname === item.path}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', display: { xs: 'none', sm: 'block' } }}>
              Welcome, Admin
            </Typography>

            <IconButton
              color="inherit"
              onClick={(e) => setUserAnchorEl(e.currentTarget)}
              sx={{ color: '#333', ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>A</Avatar>
            </IconButton>
            <Menu
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={() => setUserAnchorEl(null)}
            >
              <MenuItem onClick={() => { setUserAnchorEl(null); alert('Profile feature coming soon!'); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { setUserAnchorEl(null); alert('Settings feature coming soon!'); }}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setUserAnchorEl(null); alert('Logout feature coming soon!'); }}>
                Logout
              </MenuItem>
            </Menu>
            {!isMobile && (
              <Typography variant="body2" sx={{ color: '#333', ml: 1 }}>
                Admin User
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </>
  );
}

export default Layout;