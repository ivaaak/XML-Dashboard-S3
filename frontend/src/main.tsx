import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider } from './components/ThemeContext';
import App from './App';
import AppRoutes from './AppRoutes';

// Replace these with your actual Auth0 domain and client ID
const domain = process.env.REACT_APP_AUTH0_DOMAIN || 'your-auth0-domain';
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-auth0-client-id';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Auth0Provider>
  </React.StrictMode>
);