import axios from 'axios';

// Reduziertes Logging im Entwicklungsmodus
const isDev = process.env.NODE_ENV === 'development';

// Nur initiale Logs außerhalb von Entwicklungsumgebungen
if (!isDev) {
  console.log("[API] create-invoice handler reached");
  console.log("[API] LNBITS_API_URL:", process.env.LNBITS_API_URL);
  console.log("[API] LNBITS_API_KEY:", process.env.LNBITS_API_KEY);
  console.log("[API] LNBITS_WALLET_ID:", process.env.LNBITS_WALLET_ID);
}

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

export default async function handler(req, res) {
  if (!isDev) {
    console.log("[API] create-invoice called", { method: req.method, body: req.body });
  }
  
  if (req.method !== 'POST') return res.status(405).end();
  const { questionId, amount = 100 } = req.body;

  // Im Entwicklungsmodus: Simuliere direkt eine erfolgreich erstellte Invoice
  if (isDev) {
    return res.status(200).json({
      payment_request: "lnbcrt10n1pj4kx5ypp5dz4qhgf42qy6658qw8w0yzct5czxtmesj29ay8tn704qg2ecrvsdzxf6hqdqjd5kxecxqyjw5qcqpjsp5x7x0yp9rp5y8afr59vwadrlrp6m5jefhvyunsd8gqv3a8c0mzfqyqrzjqwd8h8d0pjeq49w9qcxrm06xh08v45k36jlka32hsqnrhepwvupcqqqqqqqqqlgqqqqqeqqjqx2qcty00dws8wqrsykcpfakdnnzws54r2vvqnk39r4snrnysxw8j47r0mz5lz2ujlh05hjz9xapqj02zgj9nn96lwz0rsjtlnvv86sp3xjs6y",
      payment_hash: "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"
    });
  }

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
      `${apiUrl}/api/v1/payments`,
      {
        out: false,
        amount,
        unit: 'sat',
        memo: `LNHunt - Frage ${questionId.replace('q', '')} freischalten`
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