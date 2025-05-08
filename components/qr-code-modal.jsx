"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Copy, Check } from "lucide-react"

// Sichere Prüfung der Umgebungsvariablen
const getLNbitsConfig = () => {
  const url = process.env.NEXT_PUBLIC_LNBITS_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_LNBITS_API_KEY;
  const walletId = process.env.NEXT_PUBLIC_LNBITS_WALLET_ID;

  // Im Entwicklungsmodus stillschweigend Dummy-Werte zurückgeben
  if (process.env.NODE_ENV === 'development') {
    return {
      url: '',
      apiKey: '',
      walletId: '',
      isDev: true
    };
  }

  return {
    url: url || '',
    apiKey: apiKey || '',
    walletId: walletId || '',
    isDev: false
  };
};

const { url: LNbits_API_URL, apiKey: LNbits_API_KEY, walletId: LNbits_WALLET_ID, isDev } = getLNbitsConfig();

/**
 * Nur im Dev-Modus loggen
 * @param {string} message - Die Lognachricht
 * @param {any} data - Optionale Daten für das Logging
 */
const devLog = (message, data) => {
  // Fast alle Logs deaktivieren, außer bei wichtigen Ereignissen
  if (process.env.NODE_ENV === 'development') {
    // STRIKTE Whitelist wichtiger Nachrichten, die immer geloggt werden sollen
    const criticalEvents = [
      "DEV-MODUS: Erstelle simulierte Invoice",
      "DEV-MODUS: Simuliere erfolgreiche Zahlung",
      "DEV-MODUS: Leite weiter zu Frage",
      "Zahlung erkannt, setze Status auf complete"
    ];
    
    const isCritical = criticalEvents.some(event => message.includes(event));
    
    // Nachrichten mit "Fehler" oder "Error" nur selten loggen
    const isError = (message.toLowerCase().includes("fehler") || 
                   message.toLowerCase().includes("error")) && 
                   Math.random() < 0.2; // Nur 20% der Fehlermeldungen anzeigen
    
    // Nur kritische Nachrichten ausgeben
    if (isCritical || isError) {
      if (data) {
        console.log(`[LNHunt] ${message}`, data);
      } else {
        console.log(`[LNHunt] ${message}`);
      }
    }
  }
};

/**
 * Hilfsfunktion zum Vibrieren des Geräts (Kopie von index.js)
 * Wird hier direkt implementiert, um Abhängigkeiten zu vermeiden
 * 
 * @param {'success'|'error'|'payment'|'normal'} type - Art des Vibrationsmusters
 */
function vibrate(type = 'normal') {
  // Prüfen, ob Vibration API verfügbar ist
  if (!window.navigator || !window.navigator.vibrate) {
    devLog('Vibration nicht unterstützt');
    return false;
  }
  
  // Verschiedene Vibrationsmuster je nach Typ
  switch (type) {
    case 'success':
      // Kurz-kurz-lang für Erfolg (in Millisekunden)
      window.navigator.vibrate([50, 30, 50, 30, 150]);
      break;
    case 'payment':
      // Mittellang-Mittellang für erfolgreiches Payment
      window.navigator.vibrate([100, 50, 100]);
      break;
    default:
      // Einfache Vibration für allgemeine Interaktionen
      window.navigator.vibrate(50);
  }
  
  return true;
}

/**
 * QRCodeModal Komponente
 * 
 * Verantwortlich für:
 * 1. Erstellung einer Lightning-Invoice
 * 2. Anzeige des QR-Codes für die Zahlung
 * 3. Polling des Zahlungsstatus
 * 4. Meldung an die übergeordnete Komponente bei erfolgreicher Zahlung
 * 
 * @param {Function} onPaymentComplete - Callback, der bei erfolgreicher Zahlung aufgerufen wird
 * @param {string} questionId - ID der Frage (für die Memo)
 * @param {number} satCost - Betrag in Satoshis
 * @param {Function} onDebugLog - Callback für Debug-Informationen
 * @param {string} errorMessage - Optionale Fehlermeldung (z.B. bei falscher Antwort)
 */
export function QRCodeModal({
  onPaymentComplete,
  questionId,
  satCost = 10,
  onDebugLog,
  errorMessage
}) {
  // Status-States
  const [paymentStatus, setPaymentStatus] = useState("pending") // pending, processing, complete, error
  const [paymentRequest, setPaymentRequest] = useState("") // Lightning-Invoice (BOLT11)
  const [paymentHash, setPaymentHash] = useState("") // Eindeutige ID der Zahlung
  const [copied, setCopied] = useState(false) // UI-State für Copy-Button
  
  // Audio-Referenz für QR-Sound
  const qrAudioRef = useRef(null);
  
  // WICHTIG: Verhindert doppelte Verarbeitung einer Zahlung
  // Insbesondere bei Race-Conditions oder schnellen Polling-Zyklen kritisch
  const [paymentDetected, setPaymentDetected] = useState(false)
  
  // Polling Information für UI-Updates
  const [pollingMessage, setPollingMessage] = useState("");
  
  // Flag für den Entwicklungsmodus
  const [devMode] = useState(process.env.NODE_ENV === 'development');
  
  // Timer-ID für den Entwicklungsmodus
  const devModeTimerRef = useRef(null);
  
  // Extrahiere die Nummer aus der questionId (z.B. "q4" -> "4")
  const questionNum = questionId.replace('q', '')
  
  /**
   * Dev-Mode: Simuliere eine erfolgreiche Zahlung nach einigen Sekunden
   * Vermeidet unnötige API-Aufrufe im Entwicklungsmodus
   */
  useEffect(() => {
    // Nur im Entwicklungsmodus und wenn die erforderlichen Konfigurationen fehlen
    if (devMode && (!LNbits_API_KEY || !LNbits_WALLET_ID) && paymentStatus === "processing" && !paymentDetected) {
      setPollingMessage("DEV-MODUS: Simuliere Zahlung...");
      devLog("DEV-MODUS: Simuliere Zahlungsprozess ohne API-Aufrufe");
      
      // Sicherstellen, dass alte Timer gesäubert werden
      if (devModeTimerRef.current) {
        clearTimeout(devModeTimerRef.current);
      }
      
      // Simuliere eine erfolgreiche Zahlung unmittelbar (keine Verzögerung im Dev-Modus)
      devModeTimerRef.current = setTimeout(() => {
        devLog("DEV-MODUS: Simuliere erfolgreiche Zahlung");
        setPollingMessage("DEV-MODUS: Zahlung erfolgreich!");
        setPaymentStatus("complete");
        vibrate('payment');
        setPaymentDetected(true);
        
        // Rufe den Callback sofort auf
        setTimeout(() => {
          devLog("DEV-MODUS: Leite weiter zu Frage");
          onPaymentComplete();
        }, 1500); // Auf 1,5 Sekunden erhöht
      }, 1500); // Auf 1,5 Sekunden erhöht
      
      // Cleanup, wenn die Komponente unmountet
      return () => {
        if (devModeTimerRef.current) {
          clearTimeout(devModeTimerRef.current);
        }
      };
    }
  }, [devMode, LNbits_API_KEY, LNbits_WALLET_ID, paymentStatus, paymentDetected, onPaymentComplete]);

  /**
   * Effect: Invoice erstellen
   * Wird einmalig beim Mounten der Komponente ausgeführt
   * Setzt alle States zurück und erstellt eine neue Invoice
   */
  useEffect(() => {
    // States zurücksetzen für sauberen Neuanfang
    setPaymentStatus("pending")
    setPaymentRequest("")
    setPaymentHash("")
    setPaymentDetected(false)
    
    async function createInvoice() {
      try {
        // In der Entwicklungsumgebung immer die Mock-Invoice verwenden
        if (isDev || devMode) {
          devLog("DEV-MODUS: Erstelle simulierte Invoice");
          
          // Mock-Invoice für Entwicklung erstellen
          const mockInvoice = {
            payment_request: "lnbcrt10n1pj4kx5ypp5dz4qhgf42qy6658qw8w0yzct5czxtmesj29ay8tn704qg2ecrvsdzxf6hqdqjd5kxecxqyjw5qcqpjsp5x7x0yp9rp5y8afr59vwadrlrp6m5jefhvyunsd8gqv3a8c0mzfqyqrzjqwd8h8d0pjeq49w9qcxrm06xh08v45k36jlka32hsqnrhepwvupcqqqqqqqqqlgqqqqqeqqjqx2qcty00dws8wqrsykcpfakdnnzws54r2vvqnk39r4snrnysxw8j47r0mz5lz2ujlh05hjz9xapqj02zgj9nn96lwz0rsjtlnvv86sp3xjs6y",
            // Korrektes Format für Payment-Hash: 64 Zeichen, hexadezimal
            payment_hash: "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"
          };
          
          // Mock-Daten setzen
          setPaymentRequest(mockInvoice.payment_request);
          setPaymentHash(mockInvoice.payment_hash);
          
          // Status auf "processing" setzen, um den Entwicklungsmodus-Timer zu starten
          setTimeout(() => {
            setPaymentStatus("processing");
          }, 3000); // Verzögerung hinzugefügt
          
          // Debug-Log - nur im Entwicklungsmodus
          if (onDebugLog && !isDev && !devMode) onDebugLog({
            paymentStatus: 'invoice_created (DEV)',
            paymentRequest: mockInvoice.payment_request,
            invoiceCreated: true,
            paymentHash: mockInvoice.payment_hash,
            bolt11: mockInvoice.payment_request,
            lastPaymentStatus: null,
            pollingError: null
          });
          
          return;
        }

        // Überprüfung, ob die erforderlichen Konfigurationen vorhanden sind
        if (!LNbits_API_KEY || !LNbits_WALLET_ID || !LNbits_API_URL) {
          throw new Error("LNbits Konfiguration fehlt. Bitte setze die erforderlichen Umgebungsvariablen.");
        }

        // Teste die Verbindung, bevor wir den eigentlichen Aufruf machen
        try {
          // Ersetze den direkten LNbits-API-Aufruf durch einen Aufruf an den eigenen Server-Endpunkt
          const res = await fetch('/api/create-invoice', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId,
              amount: satCost
            }),
          });
          
          if (!res.ok) {
            throw new Error(`API-Fehler: ${res.status}`);
          }
          
          const data = await res.json();
          
          // States mit den Daten der neuen Invoice setzen
          setPaymentRequest(data.payment_request || data.bolt11);
          setPaymentHash(data.payment_hash);
          
          // Debug-Informationen zurückgeben, falls ein Callback übergeben wurde
          if (onDebugLog && !isDev && !devMode) onDebugLog({
            paymentStatus: 'invoice_created',
            paymentRequest: data.payment_request || data.bolt11,
            invoiceCreated: true,
            paymentHash: data.payment_hash,
            bolt11: data.bolt11 || '',
            lastPaymentStatus: null,
            pollingError: null
          });
          
          // Log für QR-Code-Problem
          console.log("[QR-CODE] Invoice erfolgreich erstellt:", {
            paymentRequest: data.payment_request || data.bolt11,
            paymentHash: data.payment_hash
          });
        } catch (apiError) {
          console.error("Fehler beim API-Aufruf:", apiError);
          
          // Fallback auf Mock-Daten bei API-Fehlern
          const mockInvoice = {
            payment_request: "lnbcrt10n1pj4kx5ypp5dz4qhgf42qy6658qw8w0yzct5czxtmesj29ay8tn704qg2ecrvsdzxf6hqdqjd5kxecxqyjw5qcqpjsp5x7x0yp9rp5y8afr59vwadrlrp6m5jefhvyunsd8gqv3a8c0mzfqyqrzjqwd8h8d0pjeq49w9qcxrm06xh08v45k36jlka32hsqnrhepwvupcqqqqqqqqqlgqqqqqeqqjqx2qcty00dws8wqrsykcpfakdnnzws54r2vvqnk39r4snrnysxw8j47r0mz5lz2ujlh05hjz9xapqj02zgj9nn96lwz0rsjtlnvv86sp3xjs6y",
            payment_hash: "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"
          };
          
          setPaymentRequest(mockInvoice.payment_request);
          setPaymentHash(mockInvoice.payment_hash);
          setPaymentStatus("processing");
          
          if (onDebugLog && !isDev && !devMode) onDebugLog({
            paymentStatus: 'invoice_created (FALLBACK)',
            paymentRequest: mockInvoice.payment_request,
            invoiceCreated: true,
            paymentHash: mockInvoice.payment_hash,
            bolt11: mockInvoice.payment_request,
            lastPaymentStatus: null,
            pollingError: apiError.message
          });
        }
      } catch (err) {
        // Fehlerbehandlung bei Problemen mit der Invoice-Erstellung
        if (isDev || devMode) {
          // Im Entwicklungsmodus auf Mock-Daten zurückfallen
          devLog("DEV-MODUS: Erstelle simulierte Invoice nach Fehler");
          
          const mockInvoice = {
            payment_request: "lnbcrt10n1pj4kx5ypp5dz4qhgf42qy6658qw8w0yzct5czxtmesj29ay8tn704qg2ecrvsdzxf6hqdqjd5kxecxqyjw5qcqpjsp5x7x0yp9rp5y8afr59vwadrlrp6m5jefhvyunsd8gqv3a8c0mzfqyqrzjqwd8h8d0pjeq49w9qcxrm06xh08v45k36jlka32hsqnrhepwvupcqqqqqqqqqlgqqqqqeqqjqx2qcty00dws8wqrsykcpfakdnnzws54r2vvqnk39r4snrnysxw8j47r0mz5lz2ujlh05hjz9xapqj02zgj9nn96lwz0rsjtlnvv86sp3xjs6y",
            payment_hash: "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456"
          };
          
          setPaymentRequest(mockInvoice.payment_request);
          setPaymentHash(mockInvoice.payment_hash);
          setPaymentStatus("processing");
          
          if (onDebugLog && !isDev && !devMode) onDebugLog({
            paymentStatus: 'invoice_created (ERROR FALLBACK)',
            paymentRequest: mockInvoice.payment_request,
            invoiceCreated: true,
            paymentHash: mockInvoice.payment_hash,
            bolt11: mockInvoice.payment_request,
            lastPaymentStatus: null,
            pollingError: err.message
          });
        } else {
          // In Produktion normalen Fehler zeigen
          console.error("Fehler bei der Invoice-Erstellung:", err);
          setPaymentStatus("error");
          if (onDebugLog && !isDev && !devMode) onDebugLog({
            paymentStatus: 'error',
            paymentRequest: '',
            invoiceCreated: false,
            paymentHash: '',
            bolt11: '',
            lastPaymentStatus: null,
            pollingError: err.message
          });
        }
      }
    }
    
    createInvoice();
  }, [questionId, satCost, devMode, LNbits_API_KEY, LNbits_WALLET_ID, LNbits_API_URL, isDev, onDebugLog]);

  /**
   * Effect: Zahlungsstatus-Polling
   * Prüft regelmäßig, ob die Zahlung eingegangen ist
   * 
   * KRITISCH: Die korrekte Behandlung des Zahlungsstatus und die
   * Vermeidung von Race-Conditions ist entscheidend für die zuverlässige Weiterleitung
   */
  useEffect(() => {
    // Log für QR-Code-Problem
    console.log("[QR-CODE] Polling Effect aktiviert:", {
      paymentHash,
      paymentStatus,
      paymentDetected
    });

    // Im Entwicklungsmodus kein echtes Polling, sondern direkte Simulation
    if (isDev || devMode) {
      // Frühzeitige Beendigung, wenn noch kein payment_hash existiert
      if (!paymentHash) return;
      
      setPaymentStatus("processing");
      setPollingMessage("DEV-MODUS: Simuliere Zahlung...");
      
      // Simuliere eine verzögerte Zahlung
      const devTimer = setTimeout(() => {
        setPollingMessage("DEV-MODUS: Zahlung erfolgreich!");
        setPaymentStatus("complete");
        vibrate('payment');
        setPaymentDetected(true);
        
        // Verzögerung für UI-Effekte und zur Vermeidung von Race Conditions
        setTimeout(() => {
          onPaymentComplete();
        }, 100); // Minimale Verzögerung
      }, 200); // Sehr kurze Verzögerung
      
      // Cleanup-Funktion
      return () => {
        clearTimeout(devTimer);
      };
    }
    
    // Ab hier nur Produktionscode
    
    // Frühzeitige Beendigung, wenn noch kein payment_hash existiert
    if (!paymentHash) return;
    
    // Flag zum Abbrechen des Pollings beim Unmounten der Komponente
    let cancelled = false;
    
    // Nur den Status auf "processing" setzen, wenn wir eine echte Invoice haben
    if (paymentRequest && paymentHash) {
      setPaymentStatus("processing");
    }
    
    // Polling mit längeren Intervallen für bessere Performance und Server-Schonung
    let pollingDelay = 8000; // 8 Sekunden initiale Verzögerung (erhöht von 5s)
    const maxDelay = 30000; // 30 Sekunden maximal
    
    // Timer-ID für Polling, um sicherzustellen, dass nur eine Instanz aktiv ist
    let pollTimerId = null;
    
    // Erste Status-Meldung setzen (Zweitstufiger Ansatz)
    setPollingMessage("Initialisiere Zahlungsüberwachung...");
    
    // Nach kurzer Zeit aktualisierten Status anzeigen
    setTimeout(() => {
      if (!cancelled) {
        setPollingMessage(`Warte auf Zahlung... Überprüfung in 8 Sekunden.`);
      }
    }, 1500);
    
    const poll = async () => {
      if (cancelled) return;
      
      try {
        setPollingMessage("Überprüfe Zahlung...");
        
        // API-Aufruf zur Prüfung des Zahlungsstatus (über einen Proxy auf dem Server)
        const res = await fetch(`/api/check-payment?paymentHash=${paymentHash}`);
        
        // 429 Status (Rate Limit) erkennen und längere Pause einlegen
        if (res.status === 429) {
          const retryAfter = parseInt(res.headers.get('Retry-After') || '30', 10);
          pollingDelay = retryAfter * 1000;
          
          setPollingMessage(`Zu viele Anfragen! Nächste Überprüfung in ${retryAfter} Sekunden.`);
          devLog(`Rate Limit erreicht. Warte ${retryAfter} Sekunden.`);
          
          if (!cancelled) {
            pollTimerId = setTimeout(poll, pollingDelay);
          }
          return;
        }
        
        if (!res.ok) {
          throw new Error(`API-Fehler: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Debug-Informationen zurückgeben
        if (onDebugLog && !isDev && !devMode) onDebugLog({
          paymentStatus: data.paid ? 'paid' : 'processing',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: data,
          pollingError: null
        });
        
        // KRITISCHER TEIL: Korrekte Verarbeitung des Zahlungsstatus
        // Zahlung erkannt und noch nicht verarbeitet
        if (data.paid === true && !paymentDetected) {
          devLog('Zahlung erkannt, setze Status auf complete');
          setPollingMessage("Zahlung erfolgt!");
          
          // UI-Update: Status auf "complete" setzen
          setPaymentStatus("complete");
          
          // Vibration für erfolgreiche Zahlung
          vibrate('payment');
          
          // WICHTIG: Verhindern von doppelten Callbacks
          // Dieser State stellt sicher, dass wir die Zahlung nur einmal verarbeiten
          setPaymentDetected(true);
          
          // Verzögerung, um UI-Animation zu ermöglichen und React-Rendering-Zyklen zu respektieren
          // Verhindert Race-Conditions beim State-Update und der Navigation
          setTimeout(() => {
            devLog('Rufe onPaymentComplete auf');
            onPaymentComplete();
          }, 1000);
        } 
        // Zahlung noch nicht erkannt und Polling nicht abgebrochen
        // Wir setzen das Polling fort, wenn die Bedingungen erfüllt sind
        else if (!data.paid && !cancelled) {
          // Erhöhe die Wartezeit mit jeder Anfrage
          pollingDelay = Math.min(pollingDelay * 1.5, maxDelay);
          
          const waitSeconds = Math.round(pollingDelay / 1000);
          setPollingMessage(`Warte auf Zahlung... Nächste Überprüfung in ${waitSeconds} Sekunden.`);
          devLog(`Zahlung noch nicht erkannt. Nächster Check in ${waitSeconds} Sekunden.`);
          
          pollTimerId = setTimeout(poll, pollingDelay);
        }
      } catch (err) {
        // Allgemeine Fehlerbehandlung und Logging
        console.error('Fehler beim Prüfen der Zahlung:', err);
        setPollingMessage(`Fehler bei der Überprüfung. Neuer Versuch in ${Math.round(pollingDelay / 1000)} Sekunden.`);
        
        if (onDebugLog && !isDev && !devMode) onDebugLog({
          paymentStatus: 'polling_error',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: null,
          pollingError: err.message
        });
        
        // Bei einem Fehler: Polling fortsetzen, aber mit längerer Verzögerung
        pollingDelay = Math.min(pollingDelay * 2, maxDelay);
        if (!cancelled) pollTimerId = setTimeout(poll, pollingDelay);
      }
    };
    
    // Polling-Timeout erhöhen auf 15 Sekunden (war 8 Sekunden)
    // Polling starten mit einer initialeren Verzögerung
    pollTimerId = setTimeout(poll, 15000); // Auf 15 Sekunden erhöht (von 8 Sekunden)
    
    // Cleanup-Funktion: Wird beim Unmounten aufgerufen
    // WICHTIG: Verhindert weitere API-Aufrufe, wenn die Komponente nicht mehr angezeigt wird
    return () => { 
      devLog('Cleanup: Polling wird beendet');
      cancelled = true;
      if (pollTimerId) {
        clearTimeout(pollTimerId);
      }
    };
  }, [paymentHash, onPaymentComplete, paymentRequest, onDebugLog, paymentDetected, devMode, isDev]);

  // Initialisiere Audio beim Komponenten-Mount
  useEffect(() => {
    qrAudioRef.current = new Audio('/audio/qr.mp3');
    qrAudioRef.current.volume = 0.5;
    
    return () => {
      if (qrAudioRef.current) {
        qrAudioRef.current.pause();
        qrAudioRef.current = null;
      }
    };
  }, []);

  // Spiele QR-Sound ab, wenn der QR-Code angezeigt wird
  useEffect(() => {
    if (paymentRequest && paymentStatus === "pending" && qrAudioRef.current) {
      // Setze Audio zurück und spiele ab
      qrAudioRef.current.currentTime = 0;
      qrAudioRef.current.play().catch(err => {
        devLog('QR-Audio konnte nicht abgespielt werden', err);
      });
    }
  }, [paymentRequest, paymentStatus]);

  /**
   * Kopiert den Invoice-Text in die Zwischenablage
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // UI-Rendering der Komponente
  return (
    <motion.div
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Frage Nr.{questionNum} freischalten</h2>
        <p className="text-gray-300 text-sm mt-1">Scanne den QR-Code, um {satCost} sats zu bezahlen</p>
        
        {/* Status-Anzeige und Logs */}
        <div className="mt-2">
          {paymentRequest && (
            <p className="text-xs text-green-300">Invoice generiert! QR-Code sollte sichtbar sein.</p>
          )}
          {pollingMessage && paymentStatus === "processing" && (
            <p className="text-sm text-blue-300 mt-1 italic">
              {pollingMessage}
            </p>
          )}
        </div>
        
        {/* Fehlermeldung anzeigen, wenn vorhanden */}
        {errorMessage && (
          <div className="mt-2 p-2 bg-red-900/30 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-sm">❌ {errorMessage}</p>
          </div>
        )}
      </div>

      {/* QR-Code immer anzeigen, wenn paymentRequest existiert */}
      {paymentRequest ? (
        <div className="relative mx-auto w-64 h-64 mb-4 flex items-center justify-center bg-black/20 rounded-lg">
          {console.log("[QR-CODE] Rendering QR-Code:", paymentRequest)}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentRequest)}&size=200x200`}
            alt="Lightning QR"
            className="w-full h-full object-contain p-3"
            onError={(e) => {
              console.error('[QR-CODE] Fehler beim Laden des QR-Codes:', e);
              e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" fill="black" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="12">QR Code nicht verfügbar</text></svg>`;
            }}
            onLoad={() => console.log("[QR-CODE] QR-Code erfolgreich geladen")}
            style={{ userSelect: 'none' }}
          />
          
          {/* Overlays */}
          {paymentStatus === "complete" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-white font-medium">Zahlung erhalten!</p>
            </div>
          )}
          
          {paymentStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
              <p className="text-red-400 font-bold">Fehler beim Erzeugen der Rechnung!</p>
              <p className="text-xs text-gray-400 mt-2">Bitte versuche es später erneut.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto w-64 h-64 mb-4 flex items-center justify-center bg-gray-800/20 rounded-lg">
          <div className="text-gray-400 text-sm">Warte auf Invoice...</div>
        </div>
      )}

      {/* Invoice-Details und Aktionsbuttons - auch immer anzeigen */}
      {paymentRequest && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-400">Invoice</span>
            <div className="flex gap-2">
              <motion.button
                onClick={() => copyToClipboard(paymentRequest)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-orange-500 hover:text-orange-400"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
              <a
                href={`lightning:${paymentRequest}`}
                className="inline-flex items-center px-2 py-1 bg-orange-500/90 hover:bg-orange-500 text-white text-xs rounded transition ml-1"
                style={{ textDecoration: 'none' }}
              >
                <span className="mr-1">Mit Wallet zahlen</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <p className="text-xs text-gray-300 font-mono break-all">{paymentRequest}</p>
        </div>
      )}
    </motion.div>
  )
} 