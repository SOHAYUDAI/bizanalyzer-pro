export default async function handler(req, res) {
  // CORS対応
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'POSTメソッドのみ対応' }));
    return;
  }

  // リクエストボディ読み取り（重要！）
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const bodyText = Buffer.concat(buffers).toString();

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'リクエストボディが不正です' }));
    return;
  }

  // 必須項目チェック
  const { appName, industry, description } = body;
  if (!appName || !industry || !description) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '必須項目が入力されていません' }));
    return;
  }

  // 仮レスポンス（OpenAI API未接続でも動作確認可）
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({ message: '受信完了', data: body }));
}
