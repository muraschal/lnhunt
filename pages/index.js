"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import questions from '../questions.json'
import { QRCodeModal } from '../components/qr-code-modal'
import { AccessModal } from '../components/access-modal'
import { CheckCircle, Lock, HelpCircle, Zap } from "lucide-react"
import { ProgressIndicator } from '../components/progress-indicator'

export default function Home() {
  const [solutionWords, setSolutionWords] = useState([])
  const [currentStep, setCurrentStep] = useState('start')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  // Debug-Log-Panel State (global, für QR-Code-Status)
  const [debugLog, setDebugLog] = useState({ paymentStatus: '', paymentRequest: '', invoiceCreated: false, paymentHash: '', bolt11: '', lastPaymentStatus: null })
  const debugLogRef = useRef(setDebugLog)

  useEffect(() => {
    // Hole für jede Frage das gespeicherte Lösungswort aus localStorage
    const words = questions.map(q => {
      const word = (typeof window !== 'undefined') ? localStorage.getItem(`solution_${q.id}`) : null;
      return word || null;
    });
    setSolutionWords(words);
  }, []);

  // Erste Satz im Hangman-Style bauen (Fix the money)
  const firstSentence = questions
    .filter(q => ['q1', 'q2', 'q3'].includes(q.id))
    .sort((a, b) => {
      const order = { 'q1': 0, 'q2': 1, 'q3': 2 };
      return order[a.id] - order[b.id];
    })
    .map(q => {
      const word = solutionWords[questions.indexOf(q)];
      return word || '_'.repeat(q.answer_key.length);
    })
    .join(' ');

  // Zweite Satz im Hangman-Style bauen (Fix the world)
  const secondSentence = questions
    .filter(q => ['q4', 'q5', 'q6'].includes(q.id))
    .sort((a, b) => {
      const order = { 'q4': 0, 'q5': 1, 'q6': 2 };
      return order[a.id] - order[b.id];
    })
    .map(q => {
      const word = solutionWords[questions.indexOf(q)];
      return word || '_'.repeat(q.answer_key.length);
    })
    .join(' ');

  const handleQuestionSelect = (question) => {
    setCurrentQuestion(question)
    setCurrentStep('password')
  }

  const handlePasswordSubmit = (password) => {
    if (password.toLowerCase() === currentQuestion.access_code.toLowerCase()) {
      setCurrentStep('payment')
    }
  }

  const handlePaymentComplete = () => {
    setCurrentStep('answer')
  }

  // Callback für QRCodeModal, um den Status zu setzen
  const handleDebugLog = (log) => {
    setDebugLog(log)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-8"
          >
            <a href="/" className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
                className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-xl"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                LNHunt
              </h1>
            </a>
          </motion.div>

          <AnimatePresence mode="wait">
            {currentStep === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl"
              >
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {questions.map((question) => (
                    <motion.button
                      key={question.id}
                      onClick={() => handleQuestionSelect(question)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl backdrop-blur-md border p-2
                        ${
                          solutionWords[questions.indexOf(question)]
                            ? "border-green-500/50 bg-green-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl font-bold text-white mb-1">{question.id}</div>
                      {solutionWords[questions.indexOf(question)] ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <Lock className="w-6 h-6 text-orange-500" />
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="mb-6">
                  <ProgressIndicator
                    keywords={solutionWords.filter(Boolean)}
                    totalKeywords={6}
                    manualPhrase="Fix the money fix the world"
                  />
                </div>

                <div className="text-center text-sm text-gray-400">
                  <p>Klicke auf eine Frage, um sie freizuschalten</p>
                </div>
              </motion.div>
            )}

            {currentStep === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AccessModal
                  questionNumber={currentQuestion.id}
                  onPasswordSubmit={handlePasswordSubmit}
                  accessCode={currentQuestion.access_code}
                  hint={currentQuestion.hint}
                />
              </motion.div>
            )}

            {currentStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <QRCodeModal
                  onPaymentComplete={handlePaymentComplete}
                  questionId={currentQuestion.id}
                  satCost={10}
                  onDebugLog={handleDebugLog}
                />
              </motion.div>
            )}

            {currentStep === 'answer' && currentQuestion && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-xl"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white mb-2">{currentQuestion.question}</h2>
                  <div className="space-y-2">
                    {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className="w-full py-2 px-4 bg-white/10 rounded-lg text-white hover:bg-orange-500/80 transition"
                        // Hier könnte später die Antwortlogik ergänzt werden
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Powered by Next.js, Tailwind CSS & LNbits</p>
          </div>
        </div>
      </div>

      {/* Debug-Log-Panel unten links */}
      <div style={{ position: 'fixed', left: 0, bottom: 0, zIndex: 50, maxWidth: 500 }}>
        <div className="bg-black/80 text-green-400 text-xs font-mono p-2 rounded-tr-xl shadow-xl">
          <div>paymentStatus: {debugLog.paymentStatus}</div>
          <div>invoiceCreated: {debugLog.invoiceCreated ? 'true' : 'false'}</div>
          <div>paymentHash: {debugLog.paymentHash ? debugLog.paymentHash : 'leer'}</div>
          <div style={{ fontSize: '1rem', marginTop: 8 }}>
            <div>paymentRequest:</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '1rem', color: '#baffba' }}>{debugLog.paymentRequest || 'leer'}</pre>
          </div>
          <div style={{ fontSize: '1rem', marginTop: 8 }}>
            <div>bolt11:</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '1rem', color: '#baffba' }}>{debugLog.bolt11 || 'leer'}</pre>
          </div>
          <div style={{ fontSize: '1rem', marginTop: 8 }}>
            <div>lastPaymentStatus:</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '1rem', color: '#baffba' }}>{debugLog.lastPaymentStatus ? JSON.stringify(debugLog.lastPaymentStatus, null, 2) : 'leer'}</pre>
          </div>
          <div style={{ fontSize: '1rem', marginTop: 8 }}>
            <div>pollingError:</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '1rem', color: '#ff8888' }}>{debugLog.pollingError || 'kein Fehler'}</pre>
          </div>
        </div>
      </div>
    </main>
  );
} 