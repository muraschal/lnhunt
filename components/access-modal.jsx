"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Key, ArrowRight, HelpCircle } from "lucide-react"

export function AccessModal({
  questionNumber,
  onPasswordSubmit,
  codePhysical,
  hint
}) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Extrahiere die Nummer aus dem questionNumber (z.B. "q4" -> "4")
  const questionNum = questionNumber.replace('q', '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim().toLowerCase() === codePhysical.toLowerCase()) {
      onPasswordSubmit(input)
    } else {
      setError("Falscher physischer Code. Bitte versuche es erneut.")
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  return (
    <motion.div
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl ${
        isShaking ? "animate-shake" : ""
      }`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
          <Key className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Frage Nr.{questionNum} freischalten</h2>
        <p className="text-gray-300">Gib den physischen Code ein, um die Frage freizuschalten</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="code_physical_field" className="block text-sm text-gray-300 mb-1">Physischer Code</label>
          <input
            id="code_physical_field"
            name="code_physical_field"
            type="text"
            autoComplete="off"
            className="w-full px-3 py-2 rounded bg-white/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        {error && <div className="text-red-400 text-xs">{error}</div>}
        <motion.button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight className="w-4 h-4" />
          <span>Freischalten</span>
        </motion.button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-blue-400 underline text-sm flex items-center gap-1 mx-auto"
        >
          <HelpCircle className="w-4 h-4" />
          {showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
        </button>
        {showHint && (
          <p className="text-xs text-gray-400 mt-2 p-2 bg-blue-900/30 rounded">
            💡 {hint}
          </p>
        )}
      </div>
    </motion.div>
  )
} 