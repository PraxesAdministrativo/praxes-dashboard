// api/pluggy-transactions.js
// Endpoint para buscar transações de uma conta

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { accountId, from, to } = req.query;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId é obrigatório' });
    }

    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    // Autentica
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret })
    });

    const authData = await authResponse.json();
    const apiKey = authData.apiKey;

    // Monta query params
    let url = `https://api.pluggy.ai/transactions?accountId=${accountId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    // Busca transações
    const transactionsResponse = await fetch(url, {
      headers: { 'X-API-KEY': apiKey }
    });

    if (!transactionsResponse.ok) {
      const error = await transactionsResponse.text();
      console.error('Erro ao buscar transações:', error);
      return res.status(transactionsResponse.status).json({ error: 'Erro ao buscar transações' });
    }

    const transactions = await transactionsResponse.json();

    return res.status(200).json(transactions);

  } catch (error) {
    console.error('Erro no endpoint pluggy-transactions:', error);
    return res.status(500).json({ error: error.message });
  }
}
