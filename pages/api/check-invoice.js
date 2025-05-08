import axios from 'axios';

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;
const isDev = process.env.NODE_ENV === 'development';

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
    // Sichereres Logging ohne sensible Daten
    if (isDev) {
      console.log('[DEV] Checking invoice mit Hash:', paymentHash);
    }
    
    const response = await fetch(`${apiUrl}/payments/${paymentHash}`, {
      headers: {
        'X-Api-Key': apiKey,
        'X-Wallet-Id': walletId
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Fehler beim Abruf des Invoice-Status', details: 'Response not ok' });
    }

    const data = await response.json();
    
    // Nur im Dev-Modus Details loggen
    if (isDev) {
      console.log('[DEV] Invoice status:', data.paid ? 'bezahlt' : 'unbezahlt');
    }
    
    res.status(200).json({ paid: data.paid });
  } catch (e) {
    console.error('[API] Error checking invoice:', e.message);
    res.status(500).json({ error: 'Fehler beim Abruf des Invoice-Status', details: e.message });
  }
} 