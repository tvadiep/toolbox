const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_PATH = path.join(__dirname, 'config.json');

app.use(cors());
app.use(express.json());

// Endpoints for Threads OAuth config
app.get('/api/config', (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      res.json(config);
    } else {
      res.json({ clientId: "1291926866368063" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error reading config" });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const { clientId } = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ clientId }, null, 2));
    res.json({ message: "Config updated successfully", clientId });
  } catch (error) {
    res.status(500).json({ message: "Error writing config" });
  }
});

// Proxy endpoint for proxyxoay.shop
app.get('/api/proxy/get', async (req, res) => {
  try {
    const { key, nhamang = 'random', tinhthanh = '0', whitelist = '' } = req.query;
    if (!key) {
      return res.status(400).json({ status: 101, message: "Missing API Key" });
    }
    const apiUrl = `https://proxyxoay.shop/api/get.php?key=${key}&nhamang=${nhamang}&tinhthanh=${tinhthanh}&whitelist=${whitelist}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching proxy:', error.message);
    res.status(500).json({ status: 102, message: "Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
