import axios from 'axios';

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { questionId, amount = 100 } = req.body;

  if (!apiUrl || !apiKey || !walletId) {
    return res.status(500).json({ error: 'LNbits-Konfiguration unvollständig' });
  }
  if (!questionId) {
    return res.status(400).json({ error: 'questionId fehlt' });
  }

  try {
    console.log('Creating invoice with:', { apiUrl, amount, questionId, walletId });
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
    console.log('LNbits-Response:', resp.data);
    res.status(200).json({ 
      payment_request: resp.data.payment_request || resp.data.bolt11, 
      payment_hash: resp.data.payment_hash 
    });
  } catch (e) {
    console.error('Error creating invoice:', e.response?.data || e.message);
    res.status(500).json({ error: 'Fehler beim Erstellen der Invoice', details: e.response?.data || e.message });
  }
} 