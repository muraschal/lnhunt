"use client"

import { motion } from "framer-motion"

export function ProgressIndicator({
  keywords,
  totalKeywords,
  manualPhrase = "",
}) {
  // Create empty slots for remaining keywords
  const allKeywords = [...keywords, ...Array(totalKeywords - keywords.length).fill(null)]

  // Split the manual phrase into words
  const manualPhraseWords = manualPhrase.split(" ")

  // Create a hangman-style representation of the manual phrase
  const manualHangman = manualPhraseWords.map((word, index) => {
    if (index < keywords.length) {
      return word
    }
    return word.replace(/./g, "_")
  })

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl">
      {/* <h3 className="text-sm font-medium text-gray-300 mb-3">
        Collected Keywords: {keywords.length}/{totalKeywords}
      </h3> */}

      <div className="flex flex-wrap gap-2 mb-4">
        {allKeywords.map((keyword, index) => (
          <motion.div
            key={index}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              keyword
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                : "bg-white/5 border border-white/10 text-gray-500"
            }`}
            initial={keyword ? { scale: 0 } : { scale: 1 }}
            animate={keyword ? { scale: 1 } : { scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            {keyword || "???"}
          </motion.div>
        ))}
      </div>

      {/* First Hangman Phrase (from keywords) */}
      {keywords.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Phrase from keywords:</p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((word, index) => (
              <motion.span
                key={index}
                className="px-2 py-1 bg-white/5 rounded text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {word}
              </motion.span>
            ))}
            {Array(totalKeywords - keywords.length)
              .fill(null)
              .map((_, index) => (
                <span
                  key={`empty-${index}`}
                  className="px-2 py-1 bg-white/5 rounded border border-dashed border-white/10 text-gray-500"
                >
                  ????
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Second Hangman Phrase (manual) */}
      {keywords.length > 0 && manualPhrase && (
        <div>
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