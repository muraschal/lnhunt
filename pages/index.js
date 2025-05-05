import { useEffect, useState } from 'react';
import Link from 'next/link';
import questions from '../questions.json';

export default function Home() {
  const [solutionWords, setSolutionWords] = useState([]);

  useEffect(() => {
    // Hole für jede Frage das gespeicherte Lösungswort aus localStorage
    const words = questions.map(q => {
      const word = (typeof window !== 'undefined') ? localStorage.getItem(`solution_${q.id}`) : null;
      return word || null;
    });
    setSolutionWords(words);
  }, []);

  // Satz im Hangman-Style bauen
  const hangmanSentence = questions
    .map((q, idx) => solutionWords[idx] ? solutionWords[idx] : '_'.repeat(q.solution_word.length))
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4 text-yellow-600">⚡ lnhunt</h1>
      <div className="mb-6 text-center max-w-xl">
        <p className="mb-2">
          Willkommen zu lnhunt! Entdecke Bitcoin & Lightning in einer interaktiven Quiz-Schnitzeljagd. Jede Station wird durch eine Lightning-Zahlung freigeschaltet. Sammle die Lösungswörter und finde den finalen Satz!
        </p>
        <div className="mt-6 mb-2">
          <span className="font-mono text-lg tracking-wider bg-white px-3 py-2 rounded shadow inline-block">
            {hangmanSentence}
          </span>
        </div>
        <div className="text-xs text-gray-400">(Lösungswörter werden nach und nach aufgedeckt)</div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Quiz-Stationen</h2>
        <ul className="space-y-2">
          {questions.map(q => (
            <li key={q.id}>
              <Link href={`/${q.id}`} className="text-blue-600 underline hover:text-blue-800">
                {q.id.toUpperCase()}: {q.question.slice(0, 40)}...
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-sm text-gray-500">Powered by Next.js, Tailwind CSS & LNbits</div>
    </div>
  );
} 