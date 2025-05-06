import axios from 'axios';

console.log("[API] create-invoice handler reached");
console.log("[API] LNBITS_API_URL:", process.env.LNBITS_API_URL);
console.log("[API] LNBITS_API_KEY:", process.env.LNBITS_API_KEY);
console.log("[API] LNBITS_WALLET_ID:", process.env.LNBITS_WALLET_ID);

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

export default async function handler(req, res) {
  console.log("[API] create-invoice called", { method: req.method, body: req.body });
  if (req.method !== 'POST') return res.status(405).end();
  const { questionId, amount = 100 } = req.body;

  if (!apiUrl || !apiKey || !walletId) {
    console.error("[API] Fehlende LNbits-Konfiguration", { apiUrl, apiKey, walletId });
    return res.status(500).json({ error: 'LNbits-Konfiguration unvollständig' });
  }
  if (!questionId) {
    console.error("[API] questionId fehlt");
    return res.status(400).json({ error: 'questionId fehlt' });
  }

  try {
    console.log('[API] Invoice request', { apiUrl, amount, questionId, walletId });
    const resp = await axios.post(
      `${apiUrl}/payments`,
      {
        out: false,
        amount,
        unit: 'sat',
        memo: `Frage ${questionId}`
      },
      { 
        headers: { 
          'X-Api-Key': apiKey,
          'X-Wallet-Id': walletId
        } 
      }
    );
    console.log('[API] LNbits-Response:', resp.data);
    res.status(200).json({ 
      payment_request: resp.data.payment_request || resp.data.bolt11, 
      payment_hash: resp.data.payment_hash 
    });
  } catch (e) {
    console.error('[API] Error creating invoice:', e.response?.data || e.message);
    res.status(500).json({ error: 'Fehler beim Erstellen der Invoice', details: e.response?.data || e.message });
  }
} 