# ABS Inventory Frontend

Modern React frontend for ABS Inventory Management System built with Vite and Material-UI.

## Features
- 📊 Interactive dashboard with analytics
- 🛒 Multi-item order management
- 👥 Party and inventory management  
- 💰 Payment tracking
- 📱 Fully responsive design

## Tech Stack
- React 18 with Vite
- Material-UI (MUI) v7
- React Router v6
- Axios for API calls
- Recharts for data visualization

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Environment Variables**

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
```

## Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

Set environment variable:
- `VITE_API_URL` = Your backend API URL

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Railway
1. New project from GitHub
2. Set build command: `npm run build`
3. Add `VITE_API_URL` environment variable

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Dashboard, Orders, etc.)
├── theme.js        # MUI theme configuration
└── App.jsx         # Main app component
```

## Available Scripts
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Backend Repository
https://github.com/rishbahjain270804/abs-inventory-backend
