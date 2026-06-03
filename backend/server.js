const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const jwksRsa = require('jwks-rsa');
const { expressjwt: jwt } = require('express-jwt');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  console.warn('Warning: AUTH0_DOMAIN or AUTH0_AUDIENCE not set. Configure .env before running.');
}

const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWKS_URI
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

app.get('/api/public', (req, res) => {
  res.json({ message: 'public endpoint OK' });
});

app.get('/api/profile', jwtCheck, (req, res) => {
  const profile = {
    sub: req.auth.sub,
    email: req.auth.email || null,
    name: req.auth.name || null,
    preferred_location: req.auth['https://example.com/preferred_location'] || 'London'
  };
  res.json({ profile });
});

app.get('/api/weather', jwtCheck, async (req, res) => {
  try {
    const city = req.query.city || (req.auth && req.auth['https://example.com/preferred_location']) || 'London';
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured' });
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const resp = await axios.get(url);
    const profile = { sub: req.auth.sub, email: req.auth.email || null, name: req.auth.name || null };
    res.json({ profile, weather: resp.data });
  } catch (err) {
    console.error(err && err.message ? err.message : err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/demo-conversation', jwtCheck, async (req, res) => {
  try {
    const preferred = req.auth['https://example.com/preferred_location'] || 'London';
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured' });
    const weatherResp = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(preferred)}&units=metric&appid=${apiKey}`);
    res.json({
      message: `Hi ${req.auth.name || req.auth.email || req.auth.sub}, I fetched the weather for your preferred city (${preferred}).`,
      weather: weatherResp.data
    });
  } catch (err) {
    console.error(err && err.message ? err.message : err);
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(port, () => console.log(`API listening on ${port}`));
