import React from 'react';

export default function Thnx() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-100 to-orange-300 text-center p-8">
      <h1 className="text-5xl font-extrabold text-orange-600 mb-6 drop-shadow-lg">DANKE!</h1>
      <p className="text-xl text-orange-900 mb-4">Du hast erfolgreich teilgenommen und deine Sats zurückgesendet.</p>
      <p className="text-md text-orange-800">Wir freuen uns über dein Engagement und wünschen viel Erfolg!</p>
      <div className="mt-10 text-xs text-gray-500">&copy; {new Date().getFullYear()} Marcel Rapold</div>
    </main>
  );
} 