import axios from 'axios';

export default async function handler(req, res) {
  const apiUrl = process.env.LNBITS_API_URL || 'https://hwznode.rapold.io';
  const apiKey = process.env.LNBITS_API_KEY || '3b5a83795ead4e40a3e956f5ef476fad';
  const { questionId } = req.query;

  if (!apiUrl || !apiKey) {
    return res.status(500).json({ error: 'LNbits-API-URL oder API-Key fehlt' });
  }
  if (!questionId) {
    return res.status(400).json({ error: 'questionId fehlt' });
  }

  try {
    // Hole alle Zahlungen
    const resp = await axios.get(`${apiUrl}/api/v1/payments`, {
      headers: { 'X-Api-Key': apiKey }
    });
    // Finde Zahlung mit description === questionId und bezahlt
    const paid = resp.data.some(
      tx => tx.memo === `Frage ${questionId}` && tx.pending === false && tx.amount > 0
    );
    res.status(200).json({ paid });
  } catch (e) {
    res.status(500).json({ error: 'Fehler beim Abruf von LNbits', details: e.message });
  }
}

// Alternative Verifikationsstrategie: Suche nach bestätigter Zahlung mit memo === 'Frage q1'

 