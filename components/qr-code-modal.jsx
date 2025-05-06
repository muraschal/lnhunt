"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Copy, Check } from "lucide-react"

const LNbits_API_URL = process.env.NEXT_PUBLIC_LNBITS_API_URL || "https://hwznode.rapold.io/api/v1"
const LNbits_API_KEY = process.env.NEXT_PUBLIC_LNBITS_API_KEY || "3b5a83795ead4e40a3e956f5ef476fad"
const LNbits_WALLET_ID = process.env.NEXT_PUBLIC_LNBITS_WALLET_ID || "7d8c999bf9ba4fc3b0815fe6513f2780"

/**
 * Hilfsfunktion zum Vibrieren des Geräts (Kopie von index.js)
 * Wird hier direkt implementiert, um Abhängigkeiten zu vermeiden
 * 
 * @param {'success'|'error'|'payment'|'normal'} type - Art des Vibrationsmusters
 */
function vibrate(type = 'normal') {
  // Prüfen, ob Vibration API verfügbar ist
  if (!window.navigator || !window.navigator.vibrate) {
    console.log('Vibration nicht unterstützt');
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
  
  // WICHTIG: Verhindert doppelte Verarbeitung einer Zahlung
  // Insbesondere bei Race-Conditions oder schnellen Polling-Zyklen kritisch
  const [paymentDetected, setPaymentDetected] = useState(false)
  
  // Extrahiere die Nummer aus der questionId (z.B. "q4" -> "4")
  const questionNum = questionId.replace('q', '')

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
        // LNbits API-Aufruf zur Erstellung einer Invoice
        const res = await fetch(`${LNbits_API_URL}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": LNbits_API_KEY,
            "X-Wallet-Id": LNbits_WALLET_ID,
          },
          body: JSON.stringify({
            out: false,
            amount: satCost,
            unit: "sat",
            memo: `Frage ${questionId}`
          }),
        })
        const data = await res.json()
        
        // States mit den Daten der neuen Invoice setzen
        setPaymentRequest(data.payment_request || data.bolt11)
        setPaymentHash(data.payment_hash)
        
        // Debug-Informationen zurückgeben, falls ein Callback übergeben wurde
        if (onDebugLog) onDebugLog({
          paymentStatus: 'invoice_created',
          paymentRequest: data.payment_request || data.bolt11,
          invoiceCreated: true,
          paymentHash: data.payment_hash,
          bolt11: data.bolt11 || '',
          lastPaymentStatus: null,
          pollingError: null
        })
      } catch (err) {
        // Fehlerbehandlung bei Problemen mit der Invoice-Erstellung
        setPaymentStatus("error")
        if (onDebugLog) onDebugLog({
          paymentStatus: 'error',
          paymentRequest: '',
          invoiceCreated: false,
          paymentHash: '',
          bolt11: '',
          lastPaymentStatus: null,
          pollingError: err.message
        })
      }
    }
    
    createInvoice()
  }, [questionId, satCost])

  /**
   * Effect: Zahlungsstatus-Polling
   * Prüft regelmäßig, ob die Zahlung eingegangen ist
   * 
   * KRITISCH: Die korrekte Behandlung des Zahlungsstatus und die
   * Vermeidung von Race-Conditions ist entscheidend für die zuverlässige Weiterleitung
   */
  useEffect(() => {
    // Frühzeitige Beendigung, wenn noch kein payment_hash existiert
    if (!paymentHash) return
    
    // Flag zum Abbrechen des Pollings beim Unmounten der Komponente
    let cancelled = false
    setPaymentStatus("processing")
    
    const poll = async () => {
      try {
        // API-Aufruf zur Prüfung des Zahlungsstatus (über einen Proxy auf dem Server)
        const res = await fetch(`/api/check-payment?paymentHash=${paymentHash}`)
        const data = await res.json()
        
        // Debug-Informationen zurückgeben
        if (onDebugLog) onDebugLog({
          paymentStatus: data.paid ? 'paid' : 'processing',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: data,
          pollingError: null
        })
        
        // KRITISCHER TEIL: Korrekte Verarbeitung des Zahlungsstatus
        // Zahlung erkannt und noch nicht verarbeitet
        if (data.paid === true && !paymentDetected) {
          console.log('Zahlung erkannt, setze Status auf complete')
          
          // UI-Update: Status auf "complete" setzen
          setPaymentStatus("complete")
          
          // Vibration für erfolgreiche Zahlung
          vibrate('payment');
          
          // WICHTIG: Verhindern von doppelten Callbacks
          // Dieser State stellt sicher, dass wir die Zahlung nur einmal verarbeiten
          setPaymentDetected(true)
          
          // Verzögerung, um UI-Animation zu ermöglichen und React-Rendering-Zyklen zu respektieren
          // Verhindert Race-Conditions beim State-Update und der Navigation
          setTimeout(() => {
            console.log('Rufe onPaymentComplete auf')
            onPaymentComplete()
          }, 1000)
        } 
        // Zahlung noch nicht erkannt und Polling nicht abgebrochen
        // Wir setzen das Polling fort, wenn die Bedingungen erfüllt sind
        else if (!data.paid && !cancelled) {
          setTimeout(poll, 1000)
        }
      } catch (err) {
        // Fehlerbehandlung und Logging
        console.error('Fehler beim Prüfen der Zahlung:', err)
        if (onDebugLog) onDebugLog({
          paymentStatus: 'polling_error',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: null,
          pollingError: err.message
        })
        
        // Bei einem Fehler: Polling fortsetzen, aber mit längerer Verzögerung
        if (!cancelled) setTimeout(poll, 2000)
      }
    }
    
    // Polling starten
    poll()
    
    // Cleanup-Funktion: Wird beim Unmounten aufgerufen
    // WICHTIG: Verhindert weitere API-Aufrufe, wenn die Komponente nicht mehr angezeigt wird
    return () => { 
      console.log('Cleanup: Polling wird beendet')
      cancelled = true 
    }
  }, [paymentHash, onPaymentComplete, paymentRequest, onDebugLog, paymentDetected])

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
        
        {/* Fehlermeldung anzeigen, wenn vorhanden */}
        {errorMessage && (
          <div className="mt-2 p-2 bg-red-900/30 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-sm">❌ {errorMessage}</p>
          </div>
        )}
      </div>

      <div className="relative mx-auto w-64 h-64 mb-4 flex items-center justify-center">
        {paymentRequest && (
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentRequest)}&size=180x180`}
            alt="Lightning QR"
            className="w-full h-full"
          />
        )}
        {/* Erfolgsanzeige: Wird angezeigt, wenn die Zahlung eingegangen ist */}
        {paymentStatus === "complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-white font-medium">Zahlung erhalten!</p>
          </div>
        )}
        {/* Fehleranzeige: Wird angezeigt, wenn ein Fehler bei der Invoice-Erstellung auftritt */}
        {paymentStatus === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-red-400 font-bold">Fehler beim Erzeugen der Rechnung!</p>
            <p className="text-xs text-gray-400 mt-2">Bitte versuche es später erneut.</p>
          </div>
        )}
      </div>

      {/* Invoice-Details und Aktionsbuttons */}
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