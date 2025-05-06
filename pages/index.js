"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import questions from '../questions.json'
import { QRCodeModal } from '../components/qr-code-modal'
import { AccessModal } from '../components/access-modal'
import { CheckCircle, Lock, HelpCircle, Zap, Wrench } from "lucide-react"
import { ProgressIndicator } from '../components/progress-indicator'

export default function Home() {
  const [solutionWords, setSolutionWords] = useState([])
  const [currentStep, setCurrentStep] = useState('start')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  // Debug-Log-Panel State (global, für QR-Code-Status)
  const [debugLog, setDebugLog] = useState({ paymentStatus: '', paymentRequest: '', invoiceCreated: false, paymentHash: '', bolt11: '', lastPaymentStatus: null })
  const debugLogRef = useRef(setDebugLog)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerFeedback, setAnswerFeedback] = useState(null) // 'correct' | 'wrong' | null

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

  // Antwort-Logik für das Quiz
  const handleAnswerClick = (idx) => {
    if (selectedAnswer !== null) return // Doppelklick verhindern
    setSelectedAnswer(idx)
    if (idx === currentQuestion.correct_index) {
      setAnswerFeedback('correct')
      // Lösungswort speichern
      localStorage.setItem(`solution_${currentQuestion.id}`, currentQuestion.answer_key)
      setTimeout(() => {
        setSelectedAnswer(null)
        setAnswerFeedback(null)
        setCurrentStep('start')
        setCurrentQuestion(null)
        // Progress neu laden
        const words = questions.map(q => {
          const word = (typeof window !== 'undefined') ? localStorage.getItem(`solution_${q.id}`) : null;
          return word || null;
        });
        setSolutionWords(words);
      }, 1500)
    } else {
      setAnswerFeedback('wrong')
      setTimeout(() => {
        setSelectedAnswer(null)
        setAnswerFeedback(null)
        setCurrentStep('payment') // zurück zur Invoice
      }, 1500)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hauptinhalt */}
        <div className="mb-8">
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

                {/* Fortschrittsanzeige und Lösungswort nur anzeigen, wenn mindestens eine Frage beantwortet wurde */}
                {solutionWords.some(Boolean) && (
                  <div className="mb-6">
                    <ProgressIndicator
                      keywords={solutionWords.filter(Boolean)}
                      totalKeywords={6}
                      manualPhrase="Fix the money fix the world"
                      accessCodes={["magic", "internet", "money", "freedom", "for", "all"]}
                    />
                  </div>
                )}

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
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswerClick(idx)}
                        className={`w-full py-2 px-4 rounded-lg text-white transition font-medium
                          ${selectedAnswer === null ? 'bg-white/10 hover:bg-orange-500/80' :
                            idx === currentQuestion.correct_index && answerFeedback === 'correct' ? 'bg-green-500/80' :
                            selectedAnswer === idx && answerFeedback === 'wrong' ? 'bg-red-500/80' :
                            'bg-white/10 opacity-50'}
                        `}
                        whileTap={{ scale: 0.97 }}
                        disabled={selectedAnswer !== null}
                        animate={selectedAnswer === idx && answerFeedback === 'correct' ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {answerFeedback === 'correct' && (
                      <motion.div
                        key="richtig"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-6 text-center text-green-400 text-lg font-bold"
                      >
                        ✅ Richtig!
                      </motion.div>
                    )}
                    {answerFeedback === 'wrong' && (
                      <motion.div
                        key="falsch"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="mt-6 text-center text-red-400 text-lg font-bold"
                      >
                        ❌ Falsch! Du musst erneut bezahlen.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <a
              href="https://www.linkedin.com/in/marcelrapold/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-orange-400 underline"
            >
              Marcel Rapold
            </a>
          </div>
        </div>

        {/* Debug Button und Panel */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowDebugPanel((v) => !v)}
            className="bg-black/70 text-green-400 p-2 rounded-full shadow-lg hover:bg-orange-500/80 hover:text-white transition flex items-center gap-2"
            aria-label="Debug-Log anzeigen"
          >
            <Wrench className="w-5 h-5" />
            <span className="text-sm">{showDebugPanel ? 'Debug ausblenden' : 'Debug anzeigen'}</span>
          </button>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && (
          <div className="mt-8 p-4 bg-black/80 text-green-400 text-xs font-mono rounded-xl shadow-xl">
            <h3 className="text-sm font-bold mb-2">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs">paymentStatus: {debugLog.paymentStatus}</div>
                <div className="text-xs">invoiceCreated: {debugLog.invoiceCreated ? 'true' : 'false'}</div>
                <div className="text-xs">paymentHash: {debugLog.paymentHash ? debugLog.paymentHash : 'leer'}</div>
              </div>
              <div>
                <div className="text-xs">paymentRequest (bolt11):</div>
                <pre className="text-xs whitespace-pre-wrap break-all text-green-300">{debugLog.paymentRequest || debugLog.bolt11 || 'leer'}</pre>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs">lastPaymentStatus:</div>
                <pre className="text-xs whitespace-pre-wrap break-all text-green-300">{debugLog.lastPaymentStatus ? JSON.stringify(debugLog.lastPaymentStatus, null, 2) : 'leer'}</pre>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs">pollingError:</div>
                <pre className="text-xs whitespace-pre-wrap break-all text-red-400">{debugLog.pollingError || 'kein Fehler'}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 