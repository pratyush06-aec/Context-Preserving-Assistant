const axios = require('axios');
const assert = require('assert');

async function runTests() {
  const baseUrl = 'http://localhost:3001';

  console.log('Checking public endpoint...');
  const publicResp = await axios.get(`${baseUrl}/api/public`);
  assert.strictEqual(publicResp.data.message, 'public endpoint OK');
  console.log('Public endpoint OK');

  console.log('Checking protected endpoint rejects unauthorized requests...');
  try {
    await axios.get(`${baseUrl}/api/profile`);
    throw new Error('Protected endpoint should not succeed without a token');
  } catch (err) {
    assert(err.response, 'Expected an HTTP response');
    assert.strictEqual(err.response.status, 401);
    console.log('Protected endpoint correctly returns 401 Unauthorized');
  }

  console.log('All tests passed.');
}

runTests().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
