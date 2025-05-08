import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Thnx() {
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
            <a href="/" className="flex items-center gap-4 relative">
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
                className="bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-xl backdrop-blur-sm"
                style={{ width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Zap className="w-16 h-16 text-white" />
              </motion.div>
              
              <div className="flex flex-col items-center relative">
                <h1 className="text-6xl font-bold mb-1">
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
                    fontSize: "2.5rem",
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-white/10 border border-orange-500/30 rounded-3xl p-8 shadow-xl"
          >
            <motion.h1
              className="text-4xl mb-6 text-left font-normal"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                Gratulation!
              </span>
            </motion.h1>
            
            <p className="text-xl text-white mb-6">
              Das war ein langer, intensiver Tag – und du hast ihn durchgezogen. Respekt!
            </p>

            <p className="text-xl text-white mb-6">
              Bitcoin zeigt, was möglich ist.<br />
              Mit Lightning wird Geld wieder frei: offen, grenzenlos, sekundenschnell.
            </p>

            <p className="text-xl text-white mb-6">
              Geniesse die BTC Prague – bleib neugierig, bleib kritisch.
            </p>
            
            <p className="text-xl mb-10 font-medium">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">
                Jetzt ist Zeit für ein wohlverdientes Feierabendbier.
              </span>
            </p>

            {/* Finales Bild anstelle des Bierglases */}
            <div className="mb-8 flex justify-center">
              <div className="relative overflow-hidden rounded-xl shadow-xl backdrop-blur-md bg-white/5" style={{ width: "100%" }}>
                <img 
                  src="/images/final.png" 
                  alt="Bitcoin Feier" 
                  className="w-full rounded-xl"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium inline-flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Zurück zur Übersicht
              </Link>
            </div>
          </motion.div>

          <div className="mt-8 text-center backdrop-blur-md bg-white/5 p-4 rounded-2xl border border-white/10">
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
      </div>
    </main>
  );
}