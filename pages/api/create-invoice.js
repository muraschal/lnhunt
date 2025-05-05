import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { questionId, amount = 100 } = req.body;
  const apiUrl = process.env.LNBITS_API_URL;
  const apiKey = process.env.LNBITS_API_KEY;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'LNbits-API-URL oder API-Key fehlt' });
  }
  if (!questionId) {
    return res.status(400).json({ error: 'questionId fehlt' });
  }

  try {
    const resp = await axios.post(
      `${apiUrl}/api/v1/payments`,
      {
        out: false,
        amount,
        memo: questionId
      },
      { headers: { 'X-Api-Key': apiKey } }
    );
    console.log('LNbits-Response:', resp.data);
    res.status(200).json({ 
      payment_request: resp.data.payment_request || resp.data.bolt11, 
      payment_hash: resp.data.payment_hash 
    });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: 'Fehler beim Erstellen der Invoice', details: e.response?.data || e.message });
  }
} 