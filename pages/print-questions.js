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
        minHeight: '870px', // Reduzierte Mindestseitenhöhe
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: '0.5cm' // Zusätzlicher Abstand oben
      }}
    >
      <div>
        {/* Header mit LNHunt und Muraschal-Schriftzug */}
        <div className="text-center mb-4">
          {/* LNHunt-Schriftzug */}
          <h1 className="text-4xl font-bold mb-1" style={{ color: '#F97316' }}>
            LNHunt
          </h1>
          
          {/* "by Muraschal" in Schwarz für den Druck */}
          <div 
            style={{ 
              fontFamily: "'Parisienne', cursive, Arial, sans-serif", 
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              fontWeight: 400,
              letterSpacing: "0.5px",
              fontSize: "1.5rem",
              color: "#000000",
              marginBottom: "6px"
            }}
          >
            by Muraschal
          </div>
        </div>
        
        {/* Frage-Titel mit integrierter Nummer */}
        <h2 className="text-xl font-bold mb-4 text-center border-b-2 border-gray-200 pb-2">
          Frage Nr.{question.id.replace('q', '')} - {question.question}
        </h2>
        
        {/* Bild - jetzt mit Vollbreite aber etwas kleiner */}
        <div className="mb-5 flex justify-center">
          <div className="p-2 border border-gray-300 rounded-lg shadow-md bg-white w-full">
            <img 
              src={`/images/${question.id}.png`} 
              alt={`Bild für Frage ${question.id}`}
              style={{ 
                width: '100%',
                height: '350px', // Noch etwas kleinere Höhe
                objectFit: 'contain',
                borderRadius: '0.25rem'
              }}
              crossOrigin="anonymous"
            />
          </div>
        </div>
        
        {/* Antwortoptionen - ohne Markierung der richtigen Antwort */}
        <div className="mt-3 mb-3">
          <h3 className="text-lg font-bold mb-2 border-l-4 border-orange-500 pl-3">Antwortoptionen:</h3>
          <div className="space-y-1.5">
            {question.options && question.options.map((option, idx) => (
              <div 
                key={idx}
                className="border border-gray-300 rounded-lg p-2.5 bg-white text-black"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2.5 font-bold text-base">
                    {idx + 1}
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Code Physical */}
      <div className="mt-auto">
        <div className="font-bold text-base uppercase text-gray-600 mb-1.5 text-center">
          Code Physical
        </div>
        <div className="text-5xl font-bold text-center p-4 border-4 border-gray-800 rounded-lg bg-gray-100 shadow-inner">
          <span className="text-orange-500" style={{ letterSpacing: '0.1em' }}>{question.code_physical}</span>
        </div>
        
        <div className="text-center mt-2 text-gray-500 text-xs">
          LNHunt © {new Date().getFullYear()} by Marcel Rapold
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente für die Druckseite
export default function PrintQuestions() {
  const [isClient, setIsClient] = useState(false);
  
  // Funktion zum Drucken
  const handlePrint = () => {
    window.print();
  };
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <div className="bg-white text-black min-h-screen p-8">
      <Head>
        <title>LNHunt - Fragen zum Drucken</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            
            .print-hide {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              width: 0 !important;
              overflow: hidden !important;
              position: absolute !important;
              top: -9999px !important;
              left: -9999px !important;
            }
            
            .page-break-after {
              page-break-after: always;
              break-after: page;
            }
            
            @page {
              size: A4;
              margin: 1cm;
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
        `}} />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        {/* UI-Elemente mit verstärkten Ausblendungstechniken */}
        <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="text-3xl font-bold">LNHunt - Fragen zum Drucken</h1>
          <div>
            <button 
              onClick={handlePrint} 
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
        
        {/* Auch die Druckanleitung verstecken */}
        <div className="print-hide" style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.75rem' }}>
          <h3 className="font-bold mb-2">Anleitung zum Drucken:</h3>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem' }}>
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