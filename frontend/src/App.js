import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [result, setResult] = useState('');

  const apiRoot = process.env.REACT_APP_API_ROOT || 'http://localhost:3001';

  const callProtected = async (path) => {
    try {
      const token = await getAccessTokenSilently();
      const resp = await axios.get(`${apiRoot}${path}`, { headers: { Authorization: `Bearer ${token}` } });
      setResult(JSON.stringify(resp.data, null, 2));
    } catch (err) {
      setResult(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
    }
  };

  return (
    <div className="glass-container">
      <div className="header-section">
        <div>
          <h2>Auth0 Assistant</h2>
          <p className="subtitle">Context-Preserving Demo</p>
        </div>
        <div>
          {!isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => loginWithRedirect()}>Log in</button>
          ) : (
            <button className="btn" onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>
          )}
        </div>
      </div>

      <div className="user-info">
        <div className="avatar">
          {isAuthenticated && user ? (user.name ? user.name[0].toUpperCase() : 'U') : '?'}
        </div>
        <div>
          <strong>{isAuthenticated ? (user.name || user.email) : 'Not logged in'}</strong>
          {isAuthenticated && <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</div>}
        </div>
      </div>

      {isAuthenticated && (
        <div className="action-grid">
          <button className="btn btn-primary" onClick={() => callProtected('/api/profile')}>Call Profile API</button>
          <button className="btn btn-primary" onClick={() => callProtected('/api/weather?city=London')}>Call Weather API</button>
          <button className="btn btn-primary" onClick={() => callProtected('/api/demo-conversation')}>Demo Conversation</button>
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className="result-content">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
