import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import questions from '../questions.json';

// Umschließe den ganzen Code in einer clientseitigen Komponente
const PDFGenerator = dynamic(() => import('../components/PDFGenerator'), { 
  ssr: false,
  loading: () => <p className="text-center p-4">PDF-Komponenten werden geladen...</p>
});

// Komponentenfunktion für eine einzelne Frage
const QuestionCard = ({ question }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div 
      id={`question-${question.id}`}
      className="bg-white border-2 border-gray-300 rounded-xl p-6 mb-12 page-break-after"
      style={{
        pageBreakAfter: 'always',
        minHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Header mit Logo und Nummer */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img 
              src="/logos/LNHunt.png" 
              alt="LNHunt Logo"
              className="h-12"
            />
          </div>
          <div className="flex items-center bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
            Frage Nr.{question.id.replace('q', '')}
          </div>
        </div>
        
        {/* Frage-Titel */}
        <h2 className="text-2xl font-bold mb-8 text-center border-b-2 border-gray-200 pb-4">
          {question.question}
        </h2>
        
        {/* Bild */}
        <div className="mb-10 flex justify-center">
          <div className="p-2 border border-gray-300 rounded-lg shadow-md bg-white" style={{ maxWidth: '80%' }}>
            <img 
              src={`/images/${question.id}.png`} 
              alt={`Bild für Frage ${question.id}`}
              style={{ 
                maxHeight: '350px', 
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '0.25rem'
              }}
              crossOrigin="anonymous"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>
      </div>
      
      {/* Code Physical */}
      <div className="mt-auto">
        <div className="font-bold text-sm uppercase text-gray-500 mb-2 text-center">
          Code Physical
        </div>
        <div className="text-4xl font-bold text-center p-6 border-2 border-gray-800 rounded-lg bg-gray-100 shadow-inner">
          <span className="text-orange-500" style={{ letterSpacing: '0.1em' }}>{question.code_physical}</span>
        </div>
        
        <div className="text-center mt-4 text-gray-500 text-xs">
          LNHunt © {new Date().getFullYear()} by Marcel Rapold
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente mit Fallback für SSR
const PrintQuestions = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Lade Druckansicht...</h1>
          <p>Diese Seite wird clientseitig gerendert.</p>
        </div>
      </div>
    );
  }
  
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
              margin: 1cm;
            }
          }
        `}</style>
      </Head>
      
      <PDFGenerator questions={questions} />
    </div>
  );
};

export default PrintQuestions; 