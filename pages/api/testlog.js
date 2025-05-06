export default function handler(req, res) {
  console.log('[TESTLOG] Test-API-Route wurde aufgerufen!');
  res.status(200).json({ message: 'Testlog erfolgreich!' });
} 