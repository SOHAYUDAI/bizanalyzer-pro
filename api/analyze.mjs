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
    // リクエストボディ取得（Buffer経由）
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyText = Buffer.concat(buffers).toString();
    const body = JSON.parse(bodyText);

    const { appName, industry, description } = body;
    if (!appName || !industry || !description) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '必須項目が入力されていません' }));
      return;
    }

    // 仮のダミーAI分析結果を返す（splitエラー対策済み）
    const dummyAnalysis = `
【市場分析・競合評価】
${appName} は ${industry} 業界において有望なポジションにあります。競合との差別化が鍵となります。

【ビジネスモデル評価】
収益モデル「${body.revenueModel}」は実現可能性が高く、スケーラビリティも期待できます。

【リスク分析・課題】
現在の段階（${body.timeframe}）では、マーケットフィットと初期投資（${body.budget}万円）のバランスが重要です。
`;

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ analysis: dummyAnalysis }));
  } catch (err) {
    console.error('サーバーエラー:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'サーバーエラーが発生しました' }));
  }
}
