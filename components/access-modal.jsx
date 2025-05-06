"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Key, ArrowRight } from "lucide-react"

/**
 * Hilfsfunktion zum Vibrieren des Geräts (Kopie von index.js)
 * Wird hier direkt implementiert, um Abhängigkeiten zu vermeiden
 * 
 * @param {'success'|'error'|'payment'|'normal'} type - Art des Vibrationsmusters
 */
function vibrate(type = 'normal') {
  // Prüfen, ob Vibration API verfügbar ist
  if (!window.navigator || !window.navigator.vibrate) {
    console.log('Vibration nicht unterstützt');
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
    default:
      // Einfache Vibration für allgemeine Interaktionen
      window.navigator.vibrate(50);
  }
  
  return true;
}

export function AccessModal({
  questionNumber,
  onPasswordSubmit,
  codePhysical,
  hint
}) {
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  // Extrahiere die Nummer aus dem questionNumber (z.B. "q4" -> "4")
  const questionNum = questionNumber.replace('q', '')
  
  /**
   * Bereinigt die Eingabe:
   * 1. Entfernt alle HTML/Script-Tags
   * 2. Entfernt Steuerzeichen
   * 3. Begrenzt die Länge
   */
  const sanitizeInput = (input) => {
    if (!input) return '';
    
    // HTML-Tags entfernen
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Steuerzeichen entfernen
    sanitized = sanitized.replace(/[^\x20-\x7E]/g, '');
    
    // Länge begrenzen (50 Zeichen sollten mehr als genug sein für einen Code)
    return sanitized.slice(0, 50);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Eingabe bereinigen
    const sanitizedInput = sanitizeInput(input.trim());
    
    // Wenn die Eingabe nach der Bereinigung leer ist oder zu kurz
    if (!sanitizedInput || sanitizedInput.length < 2) {
      setError("Bitte gib einen gültigen Code ein.");
      vibrate('error');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    // Prüfen, ob der Code korrekt ist (case-insensitive)
    if (sanitizedInput.toLowerCase() === codePhysical.toLowerCase()) {
      // Erfolgsfall wird in der übergeordneten Komponente behandelt
      onPasswordSubmit(sanitizedInput);
    } else {
      // Fehler-Vibration
      vibrate('error');
      
      setError("Falscher physischer Code. Bitte versuche es erneut.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }
  
  // Input-Handler mit Validierung während der Eingabe
  const handleInputChange = (e) => {
    const rawInput = e.target.value;
    const sanitizedInput = sanitizeInput(rawInput);
    
    // Setze den bereinigten Wert zurück ins Input-Feld
    setInput(sanitizedInput);
    
    // Setze Fehler zurück sobald der Nutzer etwas eingibt
    if (error) setError("");
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
            maxLength={50}
            className="w-full px-3 py-2 rounded bg-white/20 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={input}
            onChange={handleInputChange}
            aria-describedby={error ? "code-error" : undefined}
          />
        </div>
        {error && <div id="code-error" role="alert" className="text-red-400 text-xs">{error}</div>}
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
    </motion.div>
  )
} 