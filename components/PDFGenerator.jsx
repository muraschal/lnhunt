import { useState, useRef, useEffect } from 'react';

// QuestionCard Komponente für einzelne Fragen
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

// Hauptkomponente - PDFGenerator
const PDFGenerator = ({ questions }) => {
  const [exportModule, setExportModule] = useState(null);
  
  // Lade die Module dynamisch erst im Browser
  useEffect(() => {
    const loadExportModules = async () => {
      try {
        // Dynamische Imports
        const html2canvasModule = await import('html2canvas');
        const jspdfModule = await import('jspdf');
        
        setExportModule({
          html2canvas: html2canvasModule.default,
          jsPDF: jspdfModule.jsPDF
        });
      } catch (error) {
        console.error('Fehler beim Laden der PDF-Module:', error);
      }
    };
    
    loadExportModules();
  }, []);
  
  // Funktion zum Exportieren als PDF
  const exportToPDF = async () => {
    if (!exportModule) {
      alert('Die PDF-Module werden noch geladen. Bitte versuche es in einigen Sekunden erneut.');
      return;
    }
    
    try {
      const { html2canvas, jsPDF } = exportModule;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Für jede Frage
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Hole das Element und erstelle ein Canvas
        const element = document.getElementById(`question-${question.id}`);
        if (!element) continue;
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Berechne die Höhe und Breite für das PDF
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40; // Rand links und rechts
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Neue Seite, wenn nötig
        if (i > 0) {
          pdf.addPage();
        }
        
        // Füge das Bild zum PDF hinzu
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      }
      
      // Speichere das PDF
      pdf.save('lnhunt-fragen.pdf');
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error);
      alert('Beim PDF-Export ist ein Fehler aufgetreten. Bitte versuche es erneut oder nutze die Druckfunktion des Browsers.');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-3xl font-bold">LNHunt - Fragen zum Drucken</h1>
        <div className="flex gap-3">
          <button 
            onClick={exportToPDF} 
            disabled={!exportModule}
            className={`px-6 py-3 rounded-xl font-bold shadow-lg ${
              exportModule 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {exportModule ? 'Als PDF exportieren' : 'Lade Module...'}
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600"
          >
            Direkt drucken
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
          <li>Klicke auf "Als PDF exportieren" oder "Direkt drucken"</li>
          <li>Jede Frage wird auf einer eigenen Seite dargestellt</li>
          <li>Drucke die PDF mit den Druckeinstellungen deiner Wahl</li>
          <li>Für optimale Ergebnisse: DIN A4, Querformat, Farbdruck</li>
        </ol>
      </div>
    </div>
  );
};

export default PDFGenerator; 