import axios from 'axios';

const apiUrl = process.env.LNBITS_API_URL;
const apiKey = process.env.LNBITS_API_KEY;
const walletId = process.env.LNBITS_WALLET_ID;

/**
 * Nur im Dev-Modus loggen
 * @param {string} message - Die Lognachricht
 * @param {any} data - Optionale Daten für das Logging
 */
const devLog = (message, data) => {
  // Im Entwicklungsmodus fast komplett deaktiviert für bessere Übersichtlichkeit
  if (process.env.NODE_ENV === 'development') {
    // 99% aller Logs unterdrücken
    if (Math.random() > 0.99) {
      if (data !== undefined) {
        console.log(`[API] ${message}`, data);
      } else {
        console.log(`[API] ${message}`);
      }
    }
  }
};

// Einfaches In-Memory Rate Limiting
// In einer Produktionsumgebung würde man Redis oder eine ähnliche Lösung verwenden
const rateLimits = {
  windowMs: 60 * 1000, // 1 Minute Fenster
  maxRequests: process.env.NODE_ENV === 'development' ? 15 : 30, // 15 Anfragen im Entwicklungsmodus (erhöht von 3)
  clients: new Map(), // IP -> {count, resetTime}
  paymentHashes: new Map() // paymentHash -> {count, resetTime} - Limitierung pro Hash
};

// Validiert den Hash-Parameter
function isValidPaymentHash(hash) {
  // Payment Hashes sollten 64 Zeichen lang sein und nur Hex-Zeichen enthalten
  // Im Entwicklungsmodus: Akzeptiere auch den Mock-Hash
  if (process.env.NODE_ENV === 'development' && 
      hash === "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456") {
    return true;
  }
  
  return typeof hash === 'string' && 
         /^[0-9a-fA-F]{64}$/.test(hash);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentHash } = req.query;
  
  if (!paymentHash) {
    return res.status(400).json({ error: 'paymentHash fehlt' });
  }
  
  // Validiere den payment hash gegen Injection-Angriffe
  if (!isValidPaymentHash(paymentHash)) {
    return res.status(400).json({ error: 'Ungültiger Payment Hash Format' });
  }

  // Im Entwicklungsmodus: Simuliere immer bezahlte Invoices
  // Dieser Ansatz ermöglicht ein reibungsloses Erlebnis im Entwicklungsmodus ohne echte API-Aufrufe
  if (process.env.NODE_ENV === 'development') {
    // Immer direkt mit erfolgreicher Zahlung antworten
    return res.status(200).json({ 
      paid: true,
      details: {
        checking_id: paymentHash,
        amount: 10,
        fee: 0,
        memo: "LNHunt - Dev Mode",
        time: Math.floor(Date.now() / 1000),
        bolt11: "lnbcrt10n...",
      },
      _dev_note: 'Simulierte Zahlung im Entwicklungsmodus'
    });
  }

  // Rate Limiting überprüfen - sowohl pro IP als auch pro PaymentHash
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  let limitExceeded = false;
  let retryAfter = 30;

  // 1. IP-basiertes Rate Limiting
  if (!rateLimits.clients.has(clientIp)) {
    // Neuer Client
    rateLimits.clients.set(clientIp, {
      count: 1,
      resetTime: now + rateLimits.windowMs
    });
    
    // Log im Entwicklungsmodus
    devLog(`Rate Limit (IP) - Erste Anfrage von ${clientIp}. Verbleibend: ${rateLimits.maxRequests - 1}`);
  } else {
    const clientData = rateLimits.clients.get(clientIp);
    
    // Prüfen, ob das Zeitfenster zurückgesetzt werden muss
    if (now > clientData.resetTime) {
      rateLimits.clients.set(clientIp, {
        count: 1,
        resetTime: now + rateLimits.windowMs
      });
      
      // Log im Entwicklungsmodus
      devLog(`Rate Limit (IP) - Zurückgesetzt für ${clientIp}. Verbleibend: ${rateLimits.maxRequests - 1}`);
    } else {
      // Inkrementieren und prüfen, ob das Limit überschritten wurde
      clientData.count += 1;
      
      // Log im Entwicklungsmodus
      devLog(`Rate Limit (IP) - Anfrage ${clientData.count} von ${clientIp}. Verbleibend: ${Math.max(0, rateLimits.maxRequests - clientData.count)}`);
      
      if (clientData.count > rateLimits.maxRequests) {
        retryAfter = Math.ceil((clientData.resetTime - now) / 1000);
        limitExceeded = true;
        
        // Log im Entwicklungsmodus
        devLog(`Rate Limit (IP) - ÜBERSCHRITTEN für ${clientIp}. Retry-After: ${retryAfter}s`);
      }
    }
  }

  // 2. PaymentHash-basiertes Rate Limiting (pro Hash)
  // Limitiert die Anfragen für einen bestimmten Hash, um parallele Anfragen zu vermeiden
  const hashRateLimit = Math.max(5, Math.floor(rateLimits.maxRequests / 3)); // Etwa ein Drittel des IP-Limits
  
  if (!limitExceeded) { // Nur prüfen, wenn IP-Limit nicht überschritten wurde
    if (!rateLimits.paymentHashes.has(paymentHash)) {
      // Erster Check für diesen Hash
      rateLimits.paymentHashes.set(paymentHash, {
        count: 1,
        resetTime: now + rateLimits.windowMs
      });
    } else {
      const hashData = rateLimits.paymentHashes.get(paymentHash);
      
      // Prüfen, ob das Zeitfenster zurückgesetzt werden muss
      if (now > hashData.resetTime) {
        rateLimits.paymentHashes.set(paymentHash, {
          count: 1,
          resetTime: now + rateLimits.windowMs
        });
      } else {
        // Inkrementieren und prüfen, ob das Limit überschritten wurde
        hashData.count += 1;
        
        if (hashData.count > hashRateLimit) {
          retryAfter = Math.ceil((hashData.resetTime - now) / 1000);
          limitExceeded = true;
          
          // Log im Entwicklungsmodus
          devLog(`Rate Limit (Hash) - ÜBERSCHRITTEN für Hash ${paymentHash}. Retry-After: ${retryAfter}s`);
        }
      }
    }
  }
  
  // Wenn Limit überschritten wurde, 429 zurückgeben
  if (limitExceeded) {
    return res.status(429)
      .setHeader('Retry-After', retryAfter.toString())
      .json({ 
        error: 'Too many requests',
        retryAfter: retryAfter
      });
  }

  // Regelmäßige Bereinigung der Rate Limit Maps, um Speicherlecks zu vermeiden
  if (Math.random() < 0.01) { // 1% Chance pro Request zur Bereinigung
    const ipKeysToRemove = [];
    for (const [key, value] of rateLimits.clients.entries()) {
      if (now > value.resetTime) {
        ipKeysToRemove.push(key);
      }
    }
    ipKeysToRemove.forEach(key => rateLimits.clients.delete(key));
    
    const hashKeysToRemove = [];
    for (const [key, value] of rateLimits.paymentHashes.entries()) {
      if (now > value.resetTime) {
        hashKeysToRemove.push(key);
      }
    }
    hashKeysToRemove.forEach(key => rateLimits.paymentHashes.delete(key));
  }

  if (!apiUrl || !apiKey || !walletId) {
    devLog('Entwicklungsmodus: LNbits-Konfiguration unvollständig, verwende Mock-Daten');
    
    // Mock-Daten für Entwicklung: Simuliere eine erfolgreiche Zahlung
    // In einer echten Umgebung müssen diese Werte aus der Umgebung kommen
    const mockPaid = Math.random() > 0.5; // Zufällig bezahlt oder nicht für Testzwecke
    
    return res.status(200).json({ 
      paid: mockPaid,
      _dev_note: 'Mock-Daten für Entwicklung - NICHT FÜR PRODUKTION'
    });
  }

  try {
    devLog('Checking payment with:', { apiUrl, paymentHash, walletId });
    const response = await fetch(`${apiUrl}/payments/${paymentHash}`, {
      headers: {
        'X-Api-Key': apiKey,
        'X-Wallet-Id': walletId
      },
    });
    
    if (!response.ok) {
      // Explizite Fehlerbehandlung für verschiedene HTTP Status Codes
      return res.status(response.status).json({ 
        error: `LNbits API Fehler: ${response.status}`,
        details: await response.text()
      });
    }
    
    const data = await response.json();
    devLog('Payment status:', data);
    res.status(200).json({ paid: data.paid });
  } catch (e) {
    console.error('Error checking payment:', e);
    res.status(500).json({ error: 'Fehler beim Abruf von LNbits', details: e.message });
  }
}

// Alternative Verifikationsstrategie: Suche nach bestätigter Zahlung mit memo === 'Frage q1'

 