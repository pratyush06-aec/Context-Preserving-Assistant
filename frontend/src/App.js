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
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Auth0 Assistant0 - Demo</h2>
      {!isAuthenticated && <button onClick={() => loginWithRedirect()}>Log in</button>}
      {isAuthenticated && <button onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>}
      <div style={{ marginTop: 10 }}>
        <strong>User:</strong> {isAuthenticated ? (user.name || user.email) : 'Not logged in'}
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => callProtected('/api/profile')}>Call First-Party API (Profile)</button>
        <button style={{ marginLeft: 10 }} onClick={() => callProtected('/api/weather?city=London')}>Call Weather API</button>
        <button style={{ marginLeft: 10 }} onClick={() => callProtected('/api/demo-conversation')}>Demo Conversation</button>
      </div>
      <pre style={{ marginTop: 20, background: '#f6f6f6', padding: 10, maxHeight: 400, overflow: 'auto' }}>{result}</pre>
    </div>
  );
}

export default App;
