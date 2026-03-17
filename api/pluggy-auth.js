// api/pluggy-auth.js
// Endpoint para gerar Connect Token do Pluggy

export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Credenciais do Pluggy (das variáveis de ambiente)
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Credenciais Pluggy não configuradas' });
    }

    // 1. Autentica e pega API Key
    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret
      })
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error('Erro ao autenticar no Pluggy:', error);
      return res.status(authResponse.status).json({ error: 'Erro ao autenticar' });
    }

    const authData = await authResponse.json();
    const apiKey = authData.apiKey;

    // 2. Cria Connect Token
    const connectResponse = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        clientUserId: userId
      })
    });

    if (!connectResponse.ok) {
      const error = await connectResponse.text();
      console.error('Erro ao criar Connect Token:', error);
      return res.status(connectResponse.status).json({ error: 'Erro ao criar token' });
    }

    const connectData = await connectResponse.json();

    return res.status(200).json({
      accessToken: connectData.accessToken,
      expiresAt: connectData.expiresAt
    });

  } catch (error) {
    console.error('Erro no endpoint pluggy-auth:', error);
    return res.status(500).json({ error: error.message });
  }
}
