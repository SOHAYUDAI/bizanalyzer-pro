export default async function handler(req, res) {
  // 共通レスポンス関数（CORSヘッダー込み）
  function sendJson(status, data) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(data));
  }

  // CORSプリフライト対応
  if (req.method === 'OPTIONS') {
    sendJson(200, {});
    return;
  }

  // POST以外は拒否
  if (req.method !== 'POST') {
    sendJson(405, { error: 'POSTメソッドのみ対応' });
    return;
  }

  try {
    // リクエストボディ取得（Node.jsスタイル）
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyText = Buffer.concat(buffers).toString();
    const body = JSON.parse(bodyText);

    const { appName, industry, description, revenueModel, timeframe, budget } = body;

    // 必須項目チェック
    if (!appName || !industry || !description) {
      sendJson(400, { error: '必須項目が入力されていません' });
      return;
    }

    // ダミーの分析結果（split対応）
    const dummyAnalysis = `
【市場分析・競合評価】
${appName} は ${industry} 業界において将来性があります。競合との差別化が成功の鍵です。

【ビジネスモデル評価】
収益モデル「${revenueModel}」は実現可能性があり、今後の成長が期待されます。

【リスク分析・課題】
事業の段階（${timeframe}）において、初期投資（${budget}万円）の回収が重要なポイントとなります。
`;

    // 成功レスポンス
    sendJson(200, { analysis: dummyAnalysis });
  } catch (err) {
    console.error('サーバーエラー:', err);
    sendJson(500, { error: 'サーバーエラーが発生しました' });
  }
}
