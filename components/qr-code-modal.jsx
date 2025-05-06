"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, Copy, Check } from "lucide-react"

const LNbits_API_URL = process.env.NEXT_PUBLIC_LNBITS_API_URL || "https://hwznode.rapold.io/api/v1"
const LNbits_API_KEY = process.env.NEXT_PUBLIC_LNBITS_API_KEY || "3b5a83795ead4e40a3e956f5ef476fad"
const LNbits_WALLET_ID = process.env.NEXT_PUBLIC_LNBITS_WALLET_ID || "7d8c999bf9ba4fc3b0815fe6513f2780"

export function QRCodeModal({
  onPaymentComplete,
  questionId,
  satCost = 10,
  onDebugLog
}) {
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [paymentRequest, setPaymentRequest] = useState("")
  const [paymentHash, setPaymentHash] = useState("")
  const [copied, setCopied] = useState(false)

  // Invoice erzeugen, wenn Modal geöffnet wird
  useEffect(() => {
    setPaymentStatus("pending")
    setPaymentRequest("")
    setPaymentHash("")
    async function createInvoice() {
      try {
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
        setPaymentRequest(data.payment_request || data.bolt11)
        setPaymentHash(data.payment_hash)
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

  // Polling auf Zahlungsstatus
  useEffect(() => {
    if (!paymentHash) return
    let cancelled = false
    setPaymentStatus("processing")
    const poll = async () => {
      try {
        const res = await fetch(`${LNbits_API_URL}/payments/${paymentHash}`, {
          headers: {
            "X-Api-Key": LNbits_API_KEY,
            "X-Wallet-Id": LNbits_WALLET_ID,
          },
        })
        const data = await res.json()
        if (onDebugLog) onDebugLog({
          paymentStatus: data.paid ? 'paid' : 'processing',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: data,
          pollingError: null
        })
        if (data.paid === true && !cancelled) {
          setPaymentStatus("complete")
          setTimeout(() => {
            onPaymentComplete()
          }, 1000)
        } else if (!cancelled) {
          setTimeout(poll, 2000)
        }
      } catch (err) {
        if (onDebugLog) onDebugLog({
          paymentStatus: 'polling_error',
          paymentRequest,
          invoiceCreated: true,
          paymentHash,
          bolt11: paymentRequest,
          lastPaymentStatus: null,
          pollingError: err.message
        })
        if (!cancelled) setTimeout(poll, 2000)
      }
    }
    poll()
    return () => { cancelled = true }
  }, [paymentHash, onPaymentComplete])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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

      <div className="relative mx-auto w-64 h-64 mb-4 flex items-center justify-center">
        {paymentRequest && (
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentRequest)}&size=180x180`}
            alt="Lightning QR"
            className="w-full h-full"
          />
        )}
        {paymentStatus === "complete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-white font-medium">Zahlung erhalten!</p>
          </div>
        )}
        {paymentStatus === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-red-400 font-bold">Fehler beim Erzeugen der Rechnung!</p>
            <p className="text-xs text-gray-400 mt-2">Bitte versuche es später erneut.</p>
          </div>
        )}
      </div>

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
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-xs text-gray-300 font-mono break-all">{paymentRequest}</p>
        </div>
      )}
    </motion.div>
  )
} 