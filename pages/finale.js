import { useState } from 'react';
import questions from '../questions.json';

export default function Finale() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const solution = questions.map(q => q.solution_word).join(' ');

  const checkSolution = () => {
    setResult(input.trim().toLowerCase() === solution.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Finale Lösung</h1>
      <p className="mb-4">Gib den vollständigen Lösungssatz ein, den du aus allen Stationen gesammelt hast.</p>
      <input
        className="border px-3 py-2 rounded w-full max-w-md mb-4"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Lösungssatz hier eingeben..."
      />
      <button onClick={checkSolution} className="px-4 py-2 bg-yellow-400 rounded hover:bg-yellow-500 mb-4">Prüfen</button>
      {result === true && <div className="text-green-700 font-bold">✅ Richtig! Du hast das Finale gelöst.</div>}
      {result === false && <div className="text-red-600">❌ Leider falsch. Versuche es erneut!</div>}
    </div>
  );
} 