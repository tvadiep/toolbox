const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
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

app.post('/api/scrape-images', async (req, res) => {
  console.log('>>> [BACKEND] Scrape request received for:', req.body.query);
  const { query, maxImages = 10 } = req.body;
  
  if (!query) return res.status(400).json({ message: "Missing query" });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Chuyển sang Bing Images - Nguồn ổn định và chất lượng cao
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    console.log(`[SCRAPER] Navigating to Bing: ${url}`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    // Đợi kết quả hiện ra
    await page.waitForSelector('.iusc', { timeout: 10000 }).catch(() => console.log('Timeout waiting for Bing images'));

    // Cuộn xuống để load thêm ảnh
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(2000);

    const images = await page.evaluate(() => {
      const results = [];
      // Bing lưu thông tin ảnh trong các thẻ có class .iusc dưới dạng JSON
      const items = Array.from(document.querySelectorAll('.iusc'));
      
      items.forEach(item => {
        try {
          const m = item.getAttribute('m');
          if (m) {
            const data = JSON.parse(m);
            if (data.murl) results.push(data.murl); // murl là link ảnh gốc chất lượng cao
          }
        } catch (e) {}
      });

      // Nếu không tìm thấy class .iusc, lấy thẻ img thông thường
      if (results.length === 0) {
        const imgs = Array.from(document.querySelectorAll('img.mimg'));
        imgs.forEach(img => {
          const src = img.src || img.dataset.src;
          if (src && src.startsWith('http')) results.push(src);
        });
      }
      
      return results;
    });

    console.log(`[SCRAPER] Successfully found ${images.length} images on Bing`);
    
    if (images.length === 0) {
        const debugPath = path.join(__dirname, 'debug_bing.png');
        await page.screenshot({ path: debugPath });
        console.log(`No images found. Debug screenshot saved to: ${debugPath}`);
    }

    await browser.close();
    res.json({ images: images.slice(0, maxImages) });
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) await browser.close();
    res.status(500).json({ message: "Scraping failed", error: error.message });
  }
});

app.get('/api/download-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing URL');

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    // Copy headers from original response
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename="image.jpg"`);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy download error:', error.message);
    res.status(500).send('Error downloading image');
  }
});

// Endpoint for Telegram Invite Link Generator
app.post('/api/telegram/create-links', async (req, res) => {
  const { botToken, chatId, names } = req.body;
  
  if (!names || !Array.isArray(names)) {
    return res.status(400).json({ message: "Missing names array" });
  }

  // Chế độ Mock Data để test UI
  if (botToken === 'MOCK_TOKEN') {
    const mockResults = names.map(name => ({
      name: name.trim(),
      links: [
        { name: `${name.trim()}_1`, link: `https://t.me/+mock_link_1_${name.trim()}` },
        { name: `${name.trim()}_2`, link: `https://t.me/+mock_link_2_${name.trim()}` }
      ],
      status: 'success'
    }));
    return res.json({ results: mockResults });
  }

  if (!botToken || !chatId) {
    return res.status(400).json({ message: "Missing Bot Token or Chat ID" });
  }

  const results = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i].trim();
    if (!name) continue;

    const userLinks = [];
    let hasError = false;
    let lastError = '';

    // Tạo 2 link cho mỗi user
    for (let j = 1; j <= 2; j++) {
      const linkName = `${name}_${j}`;
      try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
          chat_id: chatId,
          name: linkName,
        });

        if (response.data.ok) {
          userLinks.push({ name: linkName, link: response.data.result.invite_link });
        } else {
          throw new Error(response.data.description || 'Unknown error');
        }
        await new Promise(resolve => setTimeout(resolve, 600)); // Delay tránh rate limit
      } catch (error) {
        hasError = true;
        lastError = error.message;
        break;
      }
    }

    results.push({
      name: name,
      links: userLinks,
      status: hasError ? 'error' : 'success',
      error: lastError
    });
  }

  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
