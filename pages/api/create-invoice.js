import axios from 'axios';

// Reduziertes Logging im Entwicklungsmodus
const isDev = process.env.NODE_ENV === 'development';

// Nur in der Entwicklungsumgebung debug-loggen
if (isDev) {
  console.log("[DEV] create-invoice handler bereit für Entwicklungsmodus");
}

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

export default async function handler(req, res) {
  // Reduziertes Logging
  if (isDev) {
    console.log("[DEV] create-invoice called", { method: req.method });
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
    console.error("[API] Fehlende LNbits-Konfiguration");
    return res.status(500).json({ error: 'LNbits-Konfiguration unvollständig' });
  }
  if (!questionId) {
    console.error("[API] questionId fehlt");
    return res.status(400).json({ error: 'questionId fehlt' });
  }

  try {
    // Sicherere Logging ohne sensitive Daten
    if (isDev) {
      console.log('[DEV] Invoice request für Frage', { questionId, amount });
    }
    
    const resp = await axios.post(
      `${apiUrl}/payments`,
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
    
    // Erfolgslog ohne sensible Daten
    if (isDev) {
      console.log('[DEV] LNbits Invoice erfolgreich erstellt');
    }
    
    res.status(200).json({ 
      payment_request: resp.data.payment_request || resp.data.bolt11, 
      payment_hash: resp.data.payment_hash 
    });
  } catch (e) {
    console.error('[API] Error creating invoice:', e.response?.data || e.message);
    res.status(500).json({ error: 'Fehler beim Erstellen der Invoice', details: e.response?.data || e.message });
  }
} 