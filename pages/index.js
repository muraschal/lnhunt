"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import questions from '../questions.json'
import { QRCodeModal } from '../components/qr-code-modal'
import { AccessModal } from '../components/access-modal'
import { CheckCircle, Lock, HelpCircle, Zap, Wrench, Info, XCircle, Play, Check, Copy, BookOpen } from "lucide-react"
import { ProgressIndicator } from '../components/progress-indicator'

/**
 * Nur im Dev-Modus loggen
 * @param {string} message - Die Lognachricht
 * @param {any} data - Optionale Daten für das Logging
 */
const devLog = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Hilfsfunktion zum Vibrieren des Geräts
 * Unterstützt verschiedene Vibrationsmuster für unterschiedliche Ereignisse
 * 
 * @param {'success'|'error'|'payment'|'normal'} type - Art des Vibrationsmusters
 * @returns {boolean} - true wenn Vibration unterstützt wird und ausgeführt wurde
 */
function vibrate(type = 'normal') {
  // Prüfen, ob Vibration API verfügbar ist
  if (!window.navigator || !window.navigator.vibrate) {
    devLog('Vibration nicht unterstützt');
    return false;
  }
  
  // Verschiedene Vibrationsmuster je nach Typ
  switch (type) {
    case 'success':
      // Kurz-kurz-lang für Erfolg (in Millisekunden)
      window.navigator.vibrate([50, 30, 50, 30, 150]);
      break;
    case 'error':
      // Lang-lang für Fehler
      window.navigator.vibrate([150, 100, 150]);
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

export default function Home() {
  const [solutionCodesDigital, setSolutionCodesDigital] = useState([])
  const [currentStep, setCurrentStep] = useState('start')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending')
  // Debug-Log-Panel State (global, für QR-Code-Status)
  const [debugLog, setDebugLog] = useState({ paymentStatus: '', paymentRequest: '', invoiceCreated: false, paymentHash: '', bolt11: '', lastPaymentStatus: null })
  const debugLogRef = useRef(setDebugLog)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerFeedback, setAnswerFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  // State für Hint-Visibility im Fragenscreen
  const [showHint, setShowHint] = useState(false)
  const [showFinalModal, setShowFinalModal] = useState(false)
  // LNURL aus den Umgebungsvariablen lesen
  const FINAL_LNURL = process.env.NEXT_PUBLIC_LNBITS_LNURL_WITHDRAW || process.env.NEXT_PUBLIC_LNBITS_LNURL;
  const [copiedFinalLnurl, setCopiedFinalLnurl] = useState(false);
  const [showGuidePanel, setShowGuidePanel] = useState(false)
  // Status, ob der Benutzer den LNHunt bereits abgeschlossen hat
  const [lnhuntCompleted, setLnhuntCompleted] = useState(false)

  useEffect(() => {
    // Hole für jede Frage den gespeicherten digitalen Code aus localStorage
    const codes = questions.map(q => {
      const code = (typeof window !== 'undefined') ? localStorage.getItem(`code_digital_${q.id}`) : null;
      return code || null;
    });
    setSolutionCodesDigital(codes);
    
    // Zeige Anleitung automatisch an, wenn noch keine Frage gelöst wurde UND der Benutzer sie noch nie gesehen hat
    const anyQuestionSolved = codes.some(Boolean);
    const hasSeenGuide = localStorage.getItem('has_seen_guide') === 'true';
    setShowGuidePanel(!anyQuestionSolved && !hasSeenGuide);
    
    // Falls die Anleitung angezeigt wird, markiere sie als gesehen
    if (!anyQuestionSolved && !hasSeenGuide) {
      localStorage.setItem('has_seen_guide', 'true');
    }
    
    // Prüfe, ob der Benutzer den LNHunt bereits abgeschlossen hat
    const completed = (typeof window !== 'undefined') ? localStorage.getItem('lnhunt_completed') === 'true' : false;
    setLnhuntCompleted(completed);
  }, []);

  // Erste Satz im Hangman-Style bauen (Fix the money)
  const firstSentence = questions
    .filter(q => ['q1', 'q2', 'q3'].includes(q.id))
    .sort((a, b) => {
      const order = { 'q1': 0, 'q2': 1, 'q3': 2 };
      return order[a.id] - order[b.id];
    })
    .map(q => {
      const code = solutionCodesDigital[questions.indexOf(q)];
      return code || '_'.repeat(q.code_digital.length);
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
      const code = solutionCodesDigital[questions.indexOf(q)];
      return code || '_'.repeat(q.code_digital.length);
    })
    .join(' ');

  const handleQuestionSelect = (question) => {
    // Normale Vibration bei Auswahl einer Frage
    vibrate('normal');
    
    setCurrentQuestion(question)
    
    // Prüfen, ob die Frage bereits beantwortet wurde
    const questionIndex = questions.indexOf(question);
    const isAnswered = solutionCodesDigital[questionIndex] !== null;
    
    if (isAnswered) {
      // Wenn die Frage bereits beantwortet wurde, zeige den "Gelöst"-Bildschirm
      setCurrentStep('solved')
    } else {
      // Wenn die Frage noch nicht beantwortet wurde, normal fortfahren
      setCurrentStep('password')
    }
  }

  const handlePasswordSubmit = (codePhysical) => {
    if (codePhysical.toLowerCase() === currentQuestion.code_physical.toLowerCase()) {
      // Erfolgsfall: Richtiger Code
      vibrate('success');
      setCurrentStep('payment')
    } else {
      // Fehlerfall: Falscher Code (Vibration wird in der AccessModal-Komponente ausgelöst)
      vibrate('error');
    }
  }

  /**
   * Callback für erfolgreiche Zahlungen
   * 
   * KRITISCHER PUNKT: Stellt die Verbindung zwischen dem Zahlungsprozess und der Navigation dar.
   * 
   * Die verzögerte Ausführung (setTimeout) ist entscheidend, um Race-Conditions zu vermeiden:
   * 1. Gibt dem React-Rendering-Zyklus Zeit, alle State-Updates zu verarbeiten
   * 2. Verhindert konkurrierende Updates zwischen dem Zahlungsstatus und der Navigation
   * 3. Sorgt für eine zuverlässige Weiterleitung insbesondere auf Desktop-Browsern
   * 
   * Diese Funktion wird von der QRCodeModal-Komponente aufgerufen, wenn eine Zahlung erfolgreich war.
   */
  const handlePaymentComplete = () => {
    // Vibration für erfolgreiche Zahlung
    vibrate('payment');
    
    devLog('Payment Complete Handler aufgerufen');
    // Kurze Verzögerung, damit React die State-Updates verarbeiten kann
    setTimeout(() => {
      setCurrentStep('answer');
      devLog('Schritt auf "answer" geändert');
    }, 500);
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
      // Erfolgsfall: Richtige Antwort
      vibrate('success');
      
      setAnswerFeedback('correct')
      // Zufälligen Erfolgs-Sound abspielen
      // Aus zwei möglichen Sounds wird einer zufällig ausgewählt
      const successSounds = ['/audio/success.mp3', '/audio/success2.mp3'];
      const randomSound = successSounds[Math.floor(Math.random() * successSounds.length)];
      const audio = new Audio(randomSound);
      audio.play();
      // Digitalen Code speichern
      localStorage.setItem(`code_digital_${currentQuestion.id}`, currentQuestion.code_digital)
      setTimeout(() => {
        setSelectedAnswer(null)
        setAnswerFeedback(null)
        setCurrentStep('start')
        setCurrentQuestion(null)
        // Progress neu laden
        const codes = questions.map(q => {
          const code = (typeof window !== 'undefined') ? localStorage.getItem(`code_digital_${q.id}`) : null;
          return code || null;
        });
        setSolutionCodesDigital(codes);
      }, 1500)
    } else {
      // Fehlerfall: Falsche Antwort
      vibrate('error');
      
      setAnswerFeedback('wrong')
      // Fehler-Sound abspielen bei falscher Antwort
      const audio = new Audio('/audio/fail.mp3');
      audio.play();
      
      // Bei falscher Antwort längere Zeit zeigen, damit Benutzer die Nachricht lesen kann
      setTimeout(() => {
        setSelectedAnswer(null)
        // Wichtig: Fehlermeldung wird NICHT zurückgesetzt, damit sie im Zahlungs-Modal bleibt
        // setAnswerFeedback(null) - nicht mehr zurücksetzen
        setCurrentStep('payment') // zurück zur Invoice
      }, 3000) // Längere Anzeigezeit (3 Sekunden statt 1.5 Sekunden)
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
            <a href="/" className="flex items-center gap-2 relative">
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
              
              <div className="flex flex-col items-center relative">
                <h1 className="text-3xl font-bold mb-1">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                    LNHunt
                  </span>
                </h1>
                
                {/* Handschriftlicher "by Muraschal" Zusatz mit Parisienne Font */}
                <motion.div 
                  className="text-white"
                  style={{ 
                    fontFamily: "'Parisienne', cursive", 
                    textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
                    fontWeight: 400,
                    letterSpacing: "0.5px",
                    fontSize: "1.25rem",
                    filter: "drop-shadow(0 0 2px rgba(255, 165, 0, 0.2))",
                    opacity: 0.92,
                    marginTop: "-5px",
                    transform: "rotate(-3deg)"
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.92, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  by Muraschal
                </motion.div>
              </div>
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
                  {questions.map((question) => {
                    const solved = solutionCodesDigital[questions.indexOf(question)]
                    return (
                      <motion.button
                        key={question.id}
                        onClick={() => handleQuestionSelect(question)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl backdrop-blur-md border p-2 relative overflow-hidden
                          ${
                            solved
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Bild/Video als Hintergrund */}
                        {question.image && (
                          <div className="absolute inset-0 w-full h-full z-0">
                            <img
                              src={`/images/${question.image}`}
                              alt="Badge"
                              className={`w-full h-full object-cover rounded-xl transition-all duration-300
                                ${solved ? 'opacity-80' : 'opacity-10'}`}
                              style={{ objectPosition: 'center' }}
                            />
                            {/* Glassmorphism Overlay für ungelöste Fragen */}
                            {!solved && (
                              <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-xl z-5"></div>
                            )}
                          </div>
                        )}
                        {/* Overlay für ID und Icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                          <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                            Nr.{question.id.replace('q', '')}
                          </div>
                          {solved ? (
                            <CheckCircle className="w-6 h-6 text-green-500 drop-shadow-lg" />
                          ) : (
                            <Lock className="w-6 h-6 text-orange-500" />
                          )}
                        </div>
                        {/* Overlay für solved: halbtransparentes Layer für bessere Lesbarkeit */}
                        {solved && (
                          <div className="absolute inset-0 bg-black/30 rounded-xl z-5"></div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                
                {/* Abschluss-Button, wenn alle Fragen gelöst sind - jetzt zwischen Fragen und Codes */}
                {solutionCodesDigital.filter(Boolean).length === questions.length && !lnhuntCompleted && (
                  <div className="mb-8 flex flex-col items-center">
                    <button
                      onClick={() => setShowFinalModal(true)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition text-lg"
                    >
                      LNHunt abschliessen
                    </button>
                  </div>
                )}

                {/* Fortschrittsanzeige und Lösungswort nur anzeigen, wenn mindestens eine Frage beantwortet wurde */}
                {solutionCodesDigital.some(Boolean) && (
                  <div className="mb-6">
                    <ProgressIndicator
                      codesDigital={solutionCodesDigital.filter(Boolean)}
                      totalKeywords={6}
                      manualPhrase="Fix the money fix the world"
                      codesPhysical={questions.map(q => q.code_physical)}
                    />
                  </div>
                )}

                <div className="text-center text-sm text-gray-400">
                  {solutionCodesDigital.filter(Boolean).length !== questions.length && (
                    <p>Klicke auf eine Frage, um sie freizuschalten</p>
                  )}
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
                  codePhysical={currentQuestion.code_physical}
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
                  errorMessage={answerFeedback === 'wrong' ? 'Falsche Antwort! Du musst erneut bezahlen.' : null}
                />
              </motion.div>
            )}

            {currentStep === 'solved' && currentQuestion && (
              <motion.div
                key="solved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="backdrop-blur-xl bg-white/10 border border-green-500/30 rounded-3xl p-6 shadow-xl"
              >
                <div className="mb-4">
                  {/* Banner für "Bereits gelöst" */}
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl py-2 px-4 mb-6 text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 inline-block mr-2" />
                    <span className="text-green-400 font-medium">Diese Frage hast du bereits richtig beantwortet</span>
                  </div>
                  
                  {/* Bild oder Video über der Frage */}
                  {currentQuestion.image && (
                    <div className="flex justify-center mb-6" style={{ width: "100%" }}>
                      <video
                        src={`/images/${currentQuestion.id}.mp4`}
                        className="w-full rounded-xl border border-white/20 shadow"
                        style={{ 
                          background: '#fff', 
                          maxWidth: "100%"
                        }}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h2>
                  
                  {/* Korrekte Antwort hervorheben */}
                  <div className="space-y-2">
                    {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`w-full py-2 px-4 rounded-lg text-white ${
                          idx === currentQuestion.correct_index 
                            ? 'bg-green-500/80 border border-green-500' 
                            : 'bg-white/10 opacity-50'
                        }`}
                      >
                        {option} {idx === currentQuestion.correct_index && '✓'}
                      </div>
                    ))}
                  </div>
                  
                  {/* Digitaler Code Anzeige */}
                  <div className="mt-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-300 mb-1">Dein gesammelter Code:</p>
                    <p className="text-lg font-mono text-yellow-400 font-bold text-center">
                      {solutionCodesDigital[questions.indexOf(currentQuestion)]}
                    </p>
                  </div>
                  
                  {/* Zurück-Button */}
                  <div className="mt-6 text-center">
                    <motion.button
                      onClick={() => setCurrentStep('start')}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium inline-flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                      Zurück zur Übersicht
                    </motion.button>
                  </div>
                </div>
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
                  {/* Bild oder Video über der Frage */}
                  {currentQuestion.image && (
                    <div className="flex justify-center mb-6" style={{ width: "100%" }}>
                      <video
                        src={`/images/${currentQuestion.id}.mp4`}
                        className="w-full rounded-xl border border-white/20 shadow"
                        style={{ 
                          background: '#fff', 
                          maxWidth: "100%"
                        }}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </div>
                  )}
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
                  {/* Hinweis-Button und Anzeige */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowHint((v) => !v)}
                      className="text-blue-400 underline text-sm mb-2"
                    >
                      {showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}
                    </button>
                    {showHint && (
                      <div className="text-sm text-blue-200 mt-2 p-2 bg-blue-900/30 rounded">
                        💡 {currentQuestion.hint}
                      </div>
                    )}
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
              © {new Date().getFullYear()} Marcel Rapold
            </a>
            <span className="text-xs text-gray-500 ml-2">– Alle Rechte vorbehalten</span>
          </div>
        </div>

        {/* Debug, Info & Anleitung Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => {
              if (showGuidePanel) {
                setShowGuidePanel(false);
              } else {
                setShowGuidePanel(true);
                setShowInfoPanel(false);
                setShowDebugPanel(false);
              }
            }}
            className="bg-black/70 text-orange-400 p-2 rounded-full shadow-lg hover:bg-orange-500/80 hover:text-white transition flex items-center gap-2"
            aria-label="Anleitung anzeigen"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">{showGuidePanel ? 'Anleitung ausblenden' : 'Anleitung anzeigen'}</span>
          </button>
          <button
            onClick={() => {
              if (showInfoPanel) {
                setShowInfoPanel(false);
              } else {
                setShowInfoPanel(true);
                setShowGuidePanel(false);
                setShowDebugPanel(false);
              }
            }}
            className="bg-black/70 text-blue-400 p-2 rounded-full shadow-lg hover:bg-orange-500/80 hover:text-white transition flex items-center gap-2"
            aria-label="Info anzeigen"
          >
            <Info className="w-5 h-5" />
            <span className="text-sm">{showInfoPanel ? 'Info ausblenden' : 'Info anzeigen'}</span>
          </button>
          <button
            onClick={() => {
              if (showDebugPanel) {
                setShowDebugPanel(false);
              } else {
                setShowDebugPanel(true);
                setShowGuidePanel(false);
                setShowInfoPanel(false);
              }
            }}
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
            <div className="mb-2">
              <div>questions.length: <span className="text-white">{questions.length}</span></div>
              <div>solutionCodesDigital: <span className="text-white">{JSON.stringify(solutionCodesDigital)}</span></div>
              <div>solved: <span className="text-white">{solutionCodesDigital.filter(Boolean).length}</span></div>
              <div>lnhuntCompleted: <span className="text-white">{lnhuntCompleted ? 'true' : 'false'}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs">paymentStatus: {debugLog.paymentStatus}</div>
                <div className="text-xs">invoiceCreated: {debugLog.invoiceCreated ? 'true' : 'false'}</div>
                <div className="text-xs">paymentHash:</div>
                <pre className="text-xs whitespace-pre-wrap break-all text-white">{debugLog.paymentHash || 'leer'}</pre>
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
            {/* Cache leeren Button */}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('code_digital_')) localStorage.removeItem(key);
                  });
                  window.location.reload();
                }}
                className="bg-red-700/80 hover:bg-red-800 text-white px-4 py-2 rounded shadow text-xs font-bold"
              >
                Cache leeren
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem('lnhunt_completed');
                  setLnhuntCompleted(false);
                  devLog('LNHunt-Abschluss-Status zurückgesetzt');
                }}
                className="bg-yellow-700/80 hover:bg-yellow-800 text-white px-4 py-2 rounded shadow text-xs font-bold"
              >
                Abschluss zurücksetzen
              </button>
            </div>
          </div>
        )}

        {/* Info Panel */}
        {showInfoPanel && (
          <div className="mt-8 p-4 bg-black/80 text-blue-200 text-xs font-mono rounded-xl shadow-xl max-w-2xl mx-auto">
            <h3 className="text-sm font-bold mb-2 text-blue-400">Technische Details</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><b>Frontend:</b> Next.js 14, React 18, Tailwind CSS, Framer Motion</li>
              <li><b>UI-Komponenten:</b> Radix UI, Lucide Icons</li>
              <li><b>Lightning Backend:</b> LNbits (API, Invoice-Handling, Polling)</li>
              <li><b>Payments:</b> Lightning-native, QR-Code, Wallet-Link</li>
              <li><b>State:</b> LocalStorage für Fortschritt und Zugang</li>
              <li><b>Quiz-Content:</b> JSON-basiert, einfach anpassbar</li>
              <li><b>Analytics:</b> Vercel Analytics & Speed Insights</li>
              <li><b>Besonderheiten:</b> 2-Faktor-Freischaltung (Code + Zahlung), Responsive UI, Debug-Panel, Info-Panel</li>
            </ul>
            {/* Easteregg: Audio-Play-Buttons */}
            <div className="flex gap-6 justify-center mt-6">
              <button
                onClick={() => {
                  // Zufälligen Erfolgs-Sound abspielen (wie bei korrekten Antworten)
                  const successSounds = ['/audio/success.mp3', '/audio/success2.mp3'];
                  const randomSound = successSounds[Math.floor(Math.random() * successSounds.length)];
                  const audio = new Audio(randomSound);
                  audio.play();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded bg-green-700/30 hover:bg-green-600/60 text-green-300 shadow"
                title="Success Sound abspielen"
              >
                <CheckCircle className="w-5 h-5" />
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Success</span>
              </button>
              <button
                onClick={() => { 
                  // Fehler-Sound abspielen (wie bei falschen Antworten)
                  const a = new Audio('/audio/fail.mp3'); 
                  a.play(); 
                }}
                className="flex items-center gap-2 px-3 py-2 rounded bg-red-700/30 hover:bg-red-600/60 text-red-300 shadow"
                title="Fail Sound abspielen"
              >
                <XCircle className="w-5 h-5" />
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Fail</span>
              </button>
            </div>
          </div>
        )}

        {/* Anleitung Panel */}
        {showGuidePanel && (
          <div className="mt-8 p-4 bg-black/80 text-orange-200 text-sm rounded-xl shadow-xl max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold mb-2 text-orange-400">Kurzanleitung</h3>
            <ol className="list-decimal list-inside space-y-2 text-left mx-auto max-w-md">
              <li>Finde den <b>physischen Code</b> in der realen Welt (QR-Code, Sticker oder Hinweis).</li>
              <li>Gib den <b>physischen Code</b> ein, bezahle per Lightning und beantworte die Frage. Bei falscher Antwort musst du erneut bezahlen.</li>
              <li>Nach jeder richtigen Antwort erhältst du einen <b>digitalen Code</b>. Sammle alle <b>digitalen Codes</b>.</li>
              <li>Nach dem Lösen aller Fragen erscheint oben ein Button "LNHunt abschliessen".</li>
              <li>Scanne den QR-Code oder kopiere die LNURL, um deine Sats zu erhalten.</li>
            </ol>
          </div>
        )}

        {/* Modal */}
        {showFinalModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              className="backdrop-blur-xl bg-white/10 border border-orange-500 rounded-3xl p-6 shadow-xl max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-orange-500">Glückwunsch! Deine Belohnung</h2>
                <p className="text-gray-300 text-sm mt-1">Scanne den QR-Code, um deine Sats zu erhalten</p>
              </div>
              <div className="relative mx-auto w-64 h-64 mb-4 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${FINAL_LNURL}&size=180x180`}
                  alt="LNURL QR"
                  className="w-full h-full"
                />
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-400">LNURL</span>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => {
                        navigator.clipboard.writeText(FINAL_LNURL);
                        setCopiedFinalLnurl(true);
                        setTimeout(() => setCopiedFinalLnurl(false), 1500);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      {copiedFinalLnurl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                    <a
                      href={`lightning:${FINAL_LNURL}`}
                      className="inline-flex items-center px-2 py-1 bg-orange-500/90 hover:bg-orange-500 text-white text-xs rounded transition ml-1"
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="mr-1">Mit Wallet öffnen</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-300 font-mono break-all">{FINAL_LNURL}</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setShowFinalModal(false);
                    // Speichere im localStorage, dass der Benutzer abgeschlossen hat
                    localStorage.setItem('lnhunt_completed', 'true');
                    setLnhuntCompleted(true);
                    
                    // Nach erfolgreicher Zahlung zur Dankesseite navigieren
                    window.location.href = '/thnx';
                  }}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium"
                >
                  Schliessen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
} 