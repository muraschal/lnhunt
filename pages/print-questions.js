import { useState, useEffect } from 'react';
import Head from 'next/head';
import questions from '../questions.json';

// QuestionCard Komponente für einzelne Fragen
const QuestionCard = ({ question }) => {
  return (
    <div 
      id={`question-${question.id}`}
      className="bg-white border-2 border-gray-300 rounded-xl p-4 mb-12 page-break-after"
      style={{
        pageBreakAfter: 'always',
        minHeight: '975px', // Anpassen für A4-Größe mit Rändern
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Header mit Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* Verbesserte Logo-Darstellung */}
          <div className="flex items-center gap-4 mb-4">
            {/* Vereinfachtes Logo für bessere Druckbarkeit */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#F97316',
              borderRadius: '12px',
              position: 'relative',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}>
              {/* Einfaches, super-dickes Lightning-Symbol */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '60%',
                backgroundColor: 'white',
                clipPath: 'polygon(45% 0%, 10% 50%, 40% 50%, 20% 100%, 85% 50%, 55% 50%)',
              }} />
            </div>
            
            {/* LNHunt Schriftzug mit solidem Orange */}
            <h1 className="text-5xl font-bold" style={{ color: '#F97316' }}>
              LNHunt
            </h1>
          </div>
          
          {/* "by Muraschal" in Schwarz für den Druck */}
          <div 
            style={{ 
              fontFamily: "'Parisienne', cursive, Arial, sans-serif", 
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              fontWeight: 400,
              letterSpacing: "0.5px",
              fontSize: "1.75rem",
              transform: "rotate(-3deg)",
              color: "#000000",
              marginTop: "-5px",
              marginBottom: "10px"
            }}
          >
            by Muraschal
          </div>
        </div>
        
        {/* Frage-Titel mit integrierter Nummer */}
        <h2 className="text-3xl font-bold mb-6 text-center border-b-2 border-gray-200 pb-4">
          Frage Nr.{question.id.replace('q', '')} - {question.question}
        </h2>
        
        {/* Bild - jetzt mit Vollbreite */}
        <div className="mb-8 flex justify-center">
          <div className="p-2 border border-gray-300 rounded-lg shadow-md bg-white w-full">
            <img 
              src={`/images/${question.id}.png`} 
              alt={`Bild für Frage ${question.id}`}
              style={{ 
                width: '100%',
                height: '450px', // Etwas kleinere Höhe, um Platz für größeren Text zu schaffen
                objectFit: 'contain',
                borderRadius: '0.25rem'
              }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
        
        {/* Antwortoptionen - ohne Markierung der richtigen Antwort */}
        <div className="mt-6 mb-6">
          <h3 className="text-xl font-bold mb-4 border-l-4 border-orange-500 pl-3">Antwortoptionen:</h3>
          <div className="space-y-3">
            {question.options && question.options.map((option, idx) => (
              <div 
                key={idx}
                className="border border-gray-300 rounded-lg p-4 bg-white text-black"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4 font-bold text-lg">
                    {idx + 1}
                  </div>
                  <span className="text-xl">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Code Physical */}
      <div className="mt-auto">
        <div className="font-bold text-lg uppercase text-gray-600 mb-2 text-center">
          Code Physical
        </div>
        <div className="text-6xl font-bold text-center p-6 border-4 border-gray-800 rounded-lg bg-gray-100 shadow-inner">
          <span className="text-orange-500" style={{ letterSpacing: '0.1em' }}>{question.code_physical}</span>
        </div>
        
        <div className="text-center mt-4 text-gray-500 text-sm">
          LNHunt © {new Date().getFullYear()} by Marcel Rapold
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente für die Druckseite
export default function PrintQuestions() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="bg-white text-black min-h-screen p-8">
      <Head>
        <title>LNHunt - Fragen zum Drucken</title>
        <style jsx global>{`
          @media print {
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
            
            .page-break-after {
              page-break-after: always;
              break-after: page;
            }
            
            @page {
              size: A4;
              margin: 0.5cm;
            }
            
            /* Zusätzliche Print-Optimierungen */
            .print-force-color {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              background-color: #F97316 !important;
            }
            
            /* Stellen sicher, dass Hintergrundfarben gedruckt werden */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          
          @font-face {
            font-family: 'Parisienne';
            font-style: normal;
            font-weight: 400;
            src: url('https://fonts.gstatic.com/s/parisienne/v13/E21i_d3kivvAkxhLEVZpQyhwDw.woff2') format('woff2');
            font-display: swap;
          }
        `}</style>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-3xl font-bold">LNHunt - Fragen zum Drucken</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()} 
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600"
            >
              Drucken
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
        
        <div className="my-8 p-4 bg-gray-100 rounded-lg no-print">
          <h3 className="font-bold mb-2">Anleitung zum Drucken:</h3>
          <ol className="list-decimal list-inside">
            <li>Klicke auf "Drucken" oder nutze die Browser-Druckfunktion (Strg+P / Cmd+P)</li>
            <li>Jede Frage wird auf einer eigenen Seite dargestellt</li>
            <li>Drucke die Seiten mit den Druckeinstellungen deiner Wahl</li>
            <li>Für optimale Ergebnisse: DIN A4, Hochformat, Farbdruck</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 