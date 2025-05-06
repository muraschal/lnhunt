import React from 'react';

/**
 * Error Boundary Komponente
 * 
 * Fängt JavaScript-Fehler in Kindkomponenten ab und zeigt einen Fallback-UI
 * statt der gesamten App abzustürzen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Aktualisiere den State, so dass beim nächsten Render die Fallback UI angezeigt wird
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hier könntest du den Fehler zu einem Fehlermelde-Service deiner Wahl loggen
    console.error("Error Boundary abgefangen:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Du kannst hier jede beliebige Fallback-UI rendern
      return (
        <div className="backdrop-blur-xl bg-black/80 border border-red-500/20 rounded-3xl p-6 shadow-xl text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            Oops! Etwas ist schiefgelaufen.
          </h2>
          <p className="text-white/80 mb-6">
            Bitte lade die Seite neu oder versuche es später noch einmal.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-medium"
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 