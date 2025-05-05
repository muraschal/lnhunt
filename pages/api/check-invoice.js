import axios from 'axios';

export default async function handler(req, res) {
  const { paymentHash } = req.query;
  const apiUrl = process.env.LNBITS_API_URL;
  const apiKey = process.env.LNBITS_API_KEY;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'LNbits-API-URL oder API-Key fehlt' });
  }
  if (!paymentHash) {
    return res.status(400).json({ error: 'paymentHash fehlt' });
  }

  try {
    const resp = await axios.get(`${apiUrl}/api/v1/payments/${paymentHash}`, {
      headers: { 'X-Api-Key': apiKey }
    });
    res.status(200).json({ paid: resp.data.paid });
  } catch (e) {
    res.status(500).json({ error: 'Fehler beim Abruf des Invoice-Status', details: e.message });
  }
} 