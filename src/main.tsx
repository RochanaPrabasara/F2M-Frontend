import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: { 
          borderRadius: '12px',
          background: '#1f2937', // stone-800 dark bg
          color: '#f3f4f6',      // stone-100 light text
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '16px 20px',
          maxWidth: '420px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        },
        success: {
          style: {
            background: '#166534', // green-900
            color: '#f0fdf4',      // green-50
            border: '1px solid #15803d', // green-700
          },
          iconTheme: {
            primary: '#bbf7d0', // green-300
            secondary: '#166534',
          },
        },
        error: {
          style: {
            background: '#7f1d1d', // red-900
            color: '#fee2e2',      // red-100
            border: '1px solid #991b1b', // red-800
          },
          iconTheme: {
            primary: '#fecaca', // red-300
            secondary: '#7f1d1d',
          },
        },
      }}
    />
  </StrictMode>,
)
