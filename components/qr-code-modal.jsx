"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Zap, Copy, Check } from "lucide-react"

const LNbits_API_URL = "https://hwznode.rapold.io/api/v1/payments"
const LNbits_API_KEY = "3b5a83795ead4e40a3e956f5ef476fad"

export function QRCodeModal({
  onPaymentComplete,
  questionId,
  satCost = 10,
  onDebugLog
}) {
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [copiedLnurl, setCopiedLnurl] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState("")
  const [paymentHash, setPaymentHash] = useState("")
  const [invoiceCreated, setInvoiceCreated] = useState(false)
  const [lastPaymentStatus, setLastPaymentStatus] = useState(null)
  const [pollingError, setPollingError] = useState(null)

  // Invoice erzeugen, wenn Modal geöffnet wird
  useEffect(() => {
    if (invoiceCreated) return
    async function createInvoice() {
      setPaymentStatus("pending")
      setPaymentRequest("")
      setPaymentHash("")
      try {
        const res = await fetch(LNbits_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": LNbits_API_KEY,
          },
          body: JSON.stringify({
            out: false,
            amount: satCost,
            unit: "sat",
            memo: `Frage ${questionId}`,
          }),
        })
        const data = await res.json()
        console.log('LNbits Invoice Response:', data)
        setPaymentRequest(data.bolt11)
        setPaymentHash(data.payment_hash)
        setInvoiceCreated(true)
        if (!data.bolt11) {
          setPaymentStatus("error")
        }
      } catch (err) {
        setPaymentStatus("error")
        console.error('LNbits Invoice Error:', err)
      }
    }
    createInvoice()
  }, [questionId, satCost, invoiceCreated])

  // Reset invoiceCreated wenn questionId oder satCost sich ändern
  useEffect(() => {
    setInvoiceCreated(false)
  }, [questionId, satCost])

  // Polling auf Zahlungsstatus
  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    setPaymentStatus("processing");

    const poll = async () => {
      try {
        const url = `/api/check-payment?questionId=${questionId}`;
        console.log('Polling Backend:', url);
        const res = await fetch(url);
        const data = await res.json();
        console.log('Backend Payment Status Response:', data);
        setLastPaymentStatus(data);
        setPollingError(null);
        if (data.paid === true && !cancelled) {
          setPaymentStatus("complete");
          setTimeout(() => {
            onPaymentComplete();
          }, 1000);
        } else if (!cancelled) {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        setPollingError(err.message);
        if (!cancelled) setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [questionId, onPaymentComplete]);

  // Debug-Log-Callback bei jedem Statuswechsel
  useEffect(() => {
    if (onDebugLog) {
      onDebugLog({ paymentStatus, paymentRequest, invoiceCreated, bolt11: paymentRequest, paymentHash, lastPaymentStatus, pollingError })
    }
  }, [paymentStatus, paymentRequest, invoiceCreated, paymentHash, lastPaymentStatus, pollingError, onDebugLog])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLnurl(true)
      setTimeout(() => setCopiedLnurl(false), 2000)
    })
  }

  // Function to truncate text
  const truncateText = (text, startChars = 10, endChars = 10) => {
    if (!text) return ""
    if (text.length <= startChars + endChars) return text
    return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`
  }

  return (
    <motion.div
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Frage {questionId} freischalten</h2>
        <p className="text-gray-300 text-sm mt-1">Scanne den QR-Code, um {satCost} sats zu bezahlen</p>
      </div>

      <div className="relative mx-auto w-64 h-64 mb-4">
        {/* QR Code mit payment_request */}
        {paymentStatus === "error" && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-400 font-bold">Fehler beim Erzeugen der Rechnung!</p>
            <p className="text-xs text-gray-400 mt-2">Bitte versuche es später erneut.</p>
          </div>
        )}
        {paymentRequest && paymentStatus !== "error" && (
          <motion.div
            className="absolute inset-0 bg-white rounded-2xl p-4 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 2,
              repeat: 0,
              opacity: { duration: 0.3 },
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentRequest)}&size=180x180`}
              alt="Lightning QR"
              className="w-full h-full"
            />
          </motion.div>
        )}

        {/* Processing Hinweis unter dem QR-Code */}
        {paymentStatus === "processing" && (
          <div className="flex flex-col items-center justify-center mt-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-white font-medium">Warte auf Zahlung...</p>
          </div>
        )}

        {/* Complete overlay */}
        {paymentStatus === "complete" && (
          <motion.div
            className="absolute inset-0 bg-gray-900/80 rounded-2xl flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.1,
              }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            </motion.div>
            <p className="text-white font-medium">Zahlung erhalten!</p>
          </motion.div>
        )}
      </div>

      {/* Invoice display mit Copy-Button */}
      {paymentRequest && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-400">Invoice</span>
            <motion.button
              onClick={() => copyToClipboard(paymentRequest)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-orange-500 hover:text-orange-400"
            >
              {copiedLnurl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-xs text-gray-300 font-mono break-all">{truncateText(paymentRequest, 20, 20)}</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">Powered by Lightning Network</p>
      </div>
    </motion.div>
  )
} 