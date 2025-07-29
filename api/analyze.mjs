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

  try {
    // Node.js形式でボディを読む（← request.json() は使わない！）
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyText = Buffer.concat(buffers).toString();
    const body = JSON.parse(bodyText);

    // ダミー応答（まず動作確認）
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ message: '正常に動作しています', received: body }));

  } catch (err) {
    console.error('エラー:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'サーバーエラーが発生しました' }));
  }
}
