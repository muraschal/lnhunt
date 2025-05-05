import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import questions from '../questions.json';
import axios from 'axios';

export default function QuizStation() {
  const router = useRouter();
  const { id } = router.query;
  const [paid, setPaid] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [paymentHash, setPaymentHash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const question = questions.find(q => q.id === id);

  useEffect(() => {
    if (!id) return;
    if (localStorage.getItem(`paid_${id}`)) setPaid(true);
    if (localStorage.getItem(`solved_${id}`)) setSolved(true);
    if (!invoice) {
      setLoading(true);
      axios.post('/api/create-invoice', { questionId: id, amount: 100 })
        .then(res => {
          setInvoice(res.data.payment_request);
          setPaymentHash(res.data.payment_hash);
        })
        .catch(() => setError('Fehler beim Erstellen der Invoice'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [id, refresh]);

  useEffect(() => {
    if (!paymentHash || paid) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`/api/check-invoice?paymentHash=${paymentHash}`);
        if (res.data.paid) {
          setPaid(true);
          localStorage.setItem(`paid_${id}`, '1');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentHash, paid, id]);

  if (!question) return <div className="p-8">Frage nicht gefunden.</div>;

  const handleAnswer = idx => {
    setSelected(idx);
    if (idx === question.correct_index) {
      setSolved(true);
      localStorage.setItem(`solved_${id}`, '1');
      localStorage.setItem(`solution_${id}`, question.solution_word);
    } else {
      setPaid(false);
      setInvoice(null);
      setPaymentHash(null);
      setSelected(null);
      localStorage.removeItem(`paid_${id}`);
      setRefresh(r => r + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Station {id?.toUpperCase()}</h1>
      {!paid ? (
        <div className="bg-yellow-100 p-6 rounded shadow text-center">
          <p className="mb-4">Um die Frage freizuschalten, zahle via Lightning:</p>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {loading && <div className="mb-2">Invoice wird erstellt ...</div>}
          {invoice && (
            <div className="mb-2">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invoice)}&size=180x180`} alt="Invoice QR" />
              <div className="text-xs break-all mt-2">{invoice}</div>
            </div>
          )}
          <div className="mt-4 text-gray-600 animate-pulse">Warte auf Zahlung ...</div>
        </div>
      ) : !solved ? (
        <div className="bg-gray-100 p-6 rounded shadow max-w-md w-full">
          <div className="mb-4 font-semibold">{question.question}</div>
          <ul className="mb-4 space-y-2">
            {question.options.map((opt, idx) => (
              <li key={idx}>
                <button
                  className={`w-full px-3 py-2 rounded border ${selected === idx ? (idx === question.correct_index ? 'bg-green-200 border-green-500' : 'bg-red-200 border-red-500') : 'bg-white border-gray-300'} hover:bg-gray-50`}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowHint(!showHint)} className="text-blue-600 underline text-sm mb-2">{showHint ? 'Hinweis ausblenden' : 'Hinweis anzeigen'}</button>
          {showHint && <div className="text-sm text-gray-600 mb-2">💡 {question.hint}</div>}
          {selected !== null && selected === question.correct_index && (
            <div className="mt-4 text-green-700 font-bold">Richtig! Lösungswort: <span className="bg-yellow-200 px-2 py-1 rounded">{question.solution_word}</span></div>
          )}
          {selected !== null && selected !== question.correct_index && (
            <div className="mt-4 text-red-600">Leider falsch. Du musst erneut bezahlen, um es nochmal zu versuchen!</div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded shadow text-center">
          <div className="mb-2 font-semibold">Du hast diese Station bereits gelöst!</div>
          <div>Lösungswort: <span className="bg-yellow-200 px-2 py-1 rounded">{question.solution_word}</span></div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.push('/')}>Zurück zur Übersicht</button>
        </div>
      )}
    </div>
  );
} 