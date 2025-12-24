import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import axios from 'axios'

// Set default base URL for axios
// In production, this can be set via VITE_API_BASE_URL environment variable
// If not set, it defaults to http://localhost:5000 for local development
// In production, use relative path (empty string) so it works with the domain.
// In development, use localhost:5000.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
