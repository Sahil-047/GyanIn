import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// CRITICAL: Install aggressive EdgeStore URL interceptor BEFORE importing EdgeStore
// EdgeStore has a bug where it resolves absolute URLs relative to window.location.origin
import API_CONFIG from './config'

if (typeof window !== 'undefined' && API_CONFIG?.baseURL) {
  const backendURL = `${API_CONFIG.baseURL.replace(/\/+$/, '')}${API_CONFIG.edgestoreBasePath || '/api/edgestore'}`
  
  window.__EDGESTORE_BACKEND_URL__ = backendURL
  console.log('[Main] 🔧 Installing AGGRESSIVE EdgeStore URL interceptor')
  console.log('[Main] Target backend:', backendURL)
  
  // AGGRESSIVE: Intercept ALL fetch calls (including Request objects)
  const originalFetch = window.fetch
  window.fetch = function(input, init) {
    let url = typeof input === 'string' ? input : input?.url || ''
    
    // Check if this is an EdgeStore request to the wrong domain
    if (url && url.includes('/api/edgestore')) {
      const currentOrigin = window.location.origin
      // If URL contains current origin but should go to backend
      if (url.startsWith(currentOrigin + '/api/edgestore')) {
        const corrected = url.replace(currentOrigin, API_CONFIG.baseURL.replace(/\/+$/, ''))
        console.log('[Main] 🔧 FETCH INTERCEPTED:', url)
        console.log('[Main] 🔧 REWRITING TO:', corrected)
        
        // If input was a Request object, create new one
        if (input instanceof Request) {
          input = new Request(corrected, input)
        } else {
          input = corrected
        }
      }
      // Also catch direct wrong domain URLs
      else if (url.includes('gyanin.academy/api/edgestore') && !url.includes('api.gyanin.academy')) {
        const corrected = url.replace(/https?:\/\/gyanin\.academy\/api\/edgestore/g, backendURL)
        console.log('[Main] 🔧 FETCH INTERCEPTED (wrong domain):', url)
        console.log('[Main] 🔧 REWRITING TO:', corrected)
        if (input instanceof Request) {
          input = new Request(corrected, input)
        } else {
          input = corrected
        }
      }
    }
    
    return originalFetch.call(this, input, init)
  }
  
  // AGGRESSIVE: Intercept ALL XMLHttpRequest calls
  const originalXHROpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && url.includes('/api/edgestore')) {
      const currentOrigin = window.location.origin
      if (url.startsWith(currentOrigin + '/api/edgestore')) {
        url = url.replace(currentOrigin, API_CONFIG.baseURL.replace(/\/+$/, ''))
        console.log('[Main] 🔧 XHR INTERCEPTED:', method, url)
      } else if (url.includes('gyanin.academy/api/edgestore') && !url.includes('api.gyanin.academy')) {
        url = url.replace(/https?:\/\/gyanin\.academy\/api\/edgestore/g, backendURL)
        console.log('[Main] 🔧 XHR INTERCEPTED (wrong domain):', method, url)
      }
    }
    return originalXHROpen.call(this, method, url, ...rest)
  }
  
  console.log('[Main] ✅ AGGRESSIVE interceptors installed')
}

import { EdgeStoreProvider } from './edgestore'

// Create a custom Material UI theme matching Learnly's color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0061FF', // Bright blue like Learnly
      light: '#E6F0FF',
      dark: '#0047B3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#111827', // Dark slate for text
      light: '#4B5563',
      dark: '#030712',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <EdgeStoreProvider>
          <App />
        </EdgeStoreProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)