// api/pluggy-accounts.js
// Endpoint para buscar contas de um itemId

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { itemId } = req.query;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId é obrigatório' });
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

    // Busca contas
    const accountsResponse = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
      headers: { 'X-API-KEY': apiKey }
    });

    if (!accountsResponse.ok) {
      const error = await accountsResponse.text();
      console.error('Erro ao buscar contas:', error);
      return res.status(accountsResponse.status).json({ error: 'Erro ao buscar contas' });
    }

    const accounts = await accountsResponse.json();

    return res.status(200).json(accounts);

  } catch (error) {
    console.error('Erro no endpoint pluggy-accounts:', error);
    return res.status(500).json({ error: error.message });
  }
}
