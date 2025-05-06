import axios from 'axios';

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentHash } = req.query;

  if (!apiUrl || !apiKey || !walletId) {
    return res.status(500).json({ error: 'LNbits-Konfiguration unvollständig' });
  }
  if (!paymentHash) {
    return res.status(400).json({ error: 'paymentHash fehlt' });
  }

  try {
    console.log('Checking invoice with:', { apiUrl, paymentHash, walletId });
    const response = await fetch(`${apiUrl}/payments/${paymentHash}`, {
      headers: {
        'X-Api-Key': apiKey,
        'X-Wallet-Id': walletId
      },
    });
    const data = await response.json();
    console.log('Invoice status:', data);
    res.status(200).json({ paid: data.paid });
  } catch (e) {
    console.error('Error checking invoice:', e);
    res.status(500).json({ error: 'Fehler beim Abruf des Invoice-Status', details: e.message });
  }
} 