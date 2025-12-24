import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout';
import Notification from './components/Notification';
import Dashboard from './pages/Dashboard';
import District from './pages/District';
import Ledger from './pages/Ledger';
import Item from './pages/Item';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import EditOrder from './pages/EditOrder';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Added className="app" to utilize styles from index.css */}
      <div className="app"> 
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout>
            <Notification />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/district" element={<District />} />
              <Route path="/ledger" element={<Ledger />} />
              <Route path="/item" element={<Item />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/create" element={<CreateOrder />} />
              <Route path="/orders/edit/:id" element={<EditOrder />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;