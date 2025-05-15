// controllers/feedController.js
const axios = require('axios');
const https = require('https');
const zlib = require('zlib');

const accessToken = 'Atza|IwEBIBPMtQWDxa_3B_j8sVaokCPDXwIK7JlNCoXA9ceU5Lxv7uq5QU0OMj3QxL8oeCX89pvZz2DBWu-cc7Nbilkur1fZaTQLg7xE9jOPJo7XAsabmVt-A7bDagDqLg6YjitMfLieUaiOXlkPr3V-Mue_PkW7wWsRjmsl0NiK43p9RT74Y6ipW87SsxMhM1FZST7RkD6730hJAKApAKSawmkNTMNkaKhIhQNXwfcw0kNScaaPA3NIQApfSdTg1mXgRqVcHAO_w8UAK9lchOFAbk9OiGdvpGEvsKcTdIsV4k-ESsHYZuCMSCX43oYx_vGbXnb7JOkx0jr13xBTjXAsu_U201U_Ksb6tt7mreyKIyQmRfNdrQ'; // Replace this with your real token

const getFeedReport = async (req, res) => {
  const feedId ="64617020203";

  if (!feedId) {
    return res.status(400).json({ error: 'Feed ID is required in body.' });
  }

  try {
    // 1. Get Feed Document ID
    const feedRes = await axios.get(`https://sellingpartnerapi-eu.amazon.com/feeds/2021-06-30/feeds/${feedId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName',
        'x-amz-access-token': accessToken,
      }
    });

    const documentId = feedRes.data.resultFeedDocumentId;

    // 2. Get Download URL
    const docRes = await axios.get(`https://sellingpartnerapi-eu.amazon.com/feeds/2021-06-30/documents/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName',
        'x-amz-access-token': accessToken,
      }
    });

    const { url, compressionAlgorithm } = docRes.data;

    // 3. Download and unzip
    https.get(url, (fileRes) => {
      const gunzip = zlib.createGunzip();
      const chunks = [];

      fileRes.pipe(gunzip);

      gunzip.on('data', (chunk) => chunks.push(chunk));

      gunzip.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const reportContent = buffer.toString();
        res.status(200).send({ documentId, report: reportContent });
      });

      gunzip.on('error', (err) => {
        console.error('Decompression error:', err);
        res.status(500).json({ error: 'Error decompressing the report.' });
      });
    }).on('error', (e) => {
      console.error('HTTPS download error:', e);
      res.status(500).json({ error: 'Failed to download report.' });
    });

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

module.exports ={getFeedReport}