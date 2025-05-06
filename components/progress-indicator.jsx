"use client"

import { motion } from "framer-motion"

export function ProgressIndicator({
  codesDigital,
  totalKeywords,
  manualPhrase = "",
  codesPhysical = []
}) {
  // Create empty slots for remaining codes
  const allCodes = [...codesDigital, ...Array(totalKeywords - codesDigital.length).fill(null)]

  // codesPhysical für die Anzeige der Phrase from codes
  const phraseWords = codesPhysical.length === totalKeywords ? codesPhysical : manualPhrase.split(" ")

  // Phrase from codes: Zeige die codesPhysical an, aber nur, wenn das digitale Lösungswort für die Frage schon gelöst wurde
  const phraseFromCodes = phraseWords.map((word, index) => {
    if (index < codesDigital.length) {
      return word
    }
    return "????"
  })

  // Secret phrase bleibt wie gehabt
  const manualPhraseWords = manualPhrase.split(" ")
  const manualHangman = manualPhraseWords.map((word, index) => {
    if (index < codesDigital.length) {
      return word
    }
    return word.replace(/./g, "_")
  })

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
      {/* <h3 className="text-sm font-medium text-gray-300 mb-3">
        Collected Keywords: {codesDigital.length}/{totalKeywords}
      </h3> */}

      {/* Phrase from physical codes */}
      {codesDigital.length > 0 && (
        <div className="mb-4 keyword-phrase">
          <p className="text-sm text-gray-400 mb-2">Phrase from physical codes:</p>
          <div className="flex flex-wrap gap-2">
            {phraseFromCodes.map((word, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-white font-medium ${index < codesDigital.length ? 'bg-white/5' : 'bg-white/5 border border-dashed border-white/10 text-gray-500'}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secret phrase */}
      {codesDigital.length > 0 && manualPhrase && (
        <div className="secret-phrase">
          <p className="text-sm text-gray-400 mb-2">Secret phrase:</p>
          <div className="flex flex-wrap gap-2">
            {manualHangman.map((word, index) => (
              <motion.span
                key={index}
                className={`px-2 py-1 rounded font-mono ${
                  word.includes("_")
                    ? "bg-white/5 text-gray-500 border border-dashed border-white/10"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
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