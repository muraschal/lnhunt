"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Key, ArrowRight } from "lucide-react"

export function AccessModal({
  questionNumber,
  onPasswordSubmit,
  accessCode,
  hint
}) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Bitte gib das Passwort ein")
      return
    }

    if (password.trim().toLowerCase() === accessCode.toLowerCase()) {
      onPasswordSubmit(password.trim())
    } else {
      setError("Falsches Passwort")
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
        <h2 className="text-2xl font-bold text-white mb-2">Passwort eingeben</h2>
        <p className="text-gray-300">Gib das Passwort ein, um Frage {questionNumber} freizuschalten</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="access_code_field"
            autoComplete="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("")
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Passwort eingeben"
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>

        <motion.button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight className="w-4 h-4" />
          <span>Passwort bestätigen</span>
        </motion.button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">{hint}</p>
      </div>
    </motion.div>
  )
} 