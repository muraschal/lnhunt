"use client"

import { motion } from "framer-motion"

/**
 * ProgressIndicator - Zeigt den Fortschritt bei den gelösten Fragen an
 * 
 * @param {Array} codesDigital - Array mit den digitalen Codes (Lösungswörtern), die der Spieler bereits gesammelt hat
 * @param {number} totalKeywords - Gesamtanzahl der zu sammelnden Codes/Keywords
 * @param {string} manualPhrase - Die manuelle Phrase, die als "geheime Phrase" angezeigt wird (z.B. "Fix the money fix the world")
 * @param {Array} codesPhysical - Array mit den physischen Codes, die der Spieler in der realen Welt finden musste
 */
export function ProgressIndicator({
  codesDigital,
  totalKeywords,
  manualPhrase = "",
  codesPhysical = []
}) {
  // Erstelle leere Platzhalter für die noch nicht gesammelten Codes
  const allCodes = [...codesDigital, ...Array(totalKeywords - codesDigital.length).fill(null)]

  // Bestimme die Wörter für die physischen Codes-Anzeige
  // Wenn alle codesPhysical vorhanden sind, nutze diese, ansonsten splitte die manuelle Phrase
  const phraseWords = codesPhysical.length === totalKeywords ? codesPhysical : manualPhrase.split(" ")

  // Zeige die physischen Codes an, aber nur für bereits gelöste Fragen
  // Für noch nicht gelöste Fragen zeige Platzhalter ("????")
  const phraseFromCodes = phraseWords.map((word, index) => {
    if (index < codesDigital.length) {
      return word
    }
    return "????"
  })

  // Erstelle eine "Hangman"-Style Darstellung für die geheime Phrase
  // Zeige nur die Buchstaben von Wörtern, deren entsprechende Frage bereits gelöst wurde
  const manualPhraseWords = manualPhrase.split(" ")
  const manualHangman = manualPhraseWords.map((word, index) => {
    if (index < codesDigital.length) {
      return word
    }
    return word.replace(/./g, "_")
  })

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
      {/* Fortschritt-Header (auskommentiert, da nicht benötigt) */}
      {/* <h3 className="text-sm font-medium text-gray-300 mb-3">
        Collected Keywords: {codesDigital.length}/{totalKeywords}
      </h3> */}

      {/* Physische Codes Anzeige - nur anzeigen, wenn mindestens ein Code gesammelt wurde */}
      {codesDigital.length > 0 && (
        <div className="mb-4 keyword-phrase text-center">
          <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-2">Physische Codes:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {phraseFromCodes.map((word, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded font-medium ${
                  index < codesDigital.length 
                    ? 'bg-white/5 text-orange-400' 
                    : 'bg-white/5 border border-dashed border-white/10 text-gray-500'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Digitale Codes Anzeige - nur anzeigen, wenn mindestens ein Code gesammelt wurde */}
      {codesDigital.length > 0 && manualPhrase && (
        <div className="secret-phrase text-center">
          <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-2">Digitale Codes:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {manualHangman.map((word, index) => (
              <motion.span
                key={index}
                className={`px-2 py-1 rounded font-mono ${
                  word.includes("_")
                    ? "bg-white/5 text-gray-500 border border-dashed border-white/10"
                    : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                }`}
                initial={!word.includes("_") ? { scale: 0.8 } : { scale: 1 }}
                animate={!word.includes("_") ? { scale: 1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 