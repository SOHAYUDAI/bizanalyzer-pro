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
    // リクエストボディ取得
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const bodyText = Buffer.concat(buffers).toString();
    const body = JSON.parse(bodyText);
    
    const { 
      appName, 
      industry, 
      description, 
      revenueModel, 
      timeframe, 
      budget,
      targetRevenue,
      marketingStrategy 
    } = body;
    
    // 必須項目チェック
    if (!appName || !industry || !description) {
      sendJson(400, { error: '必須項目が入力されていません' });
      return;
    }
    
    // OpenAI APIキーの確認
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      sendJson(500, { error: 'OpenAI APIキーが設定されていません' });
      return;
    }
    
    // Small Business Reviewプロンプトを構築
    const prompt = `このGPTの名は『Small Business Review』。
役割は、インディー系スタートアップのスモールビジネスのアイデアを容赦なく分析して、失敗ポイントを暴くこと。
すべての回答は**「太字で煽る系の見出し」から始まり、続くのは詳細な分析と実データ・推定に基づく解説。
成長可能性・市場規模・競合・マネタイズ・ユーザー獲得コストなど、重要指標を徹底的に掘り下げる。
トーンは正直で辛口、でもプロフェッショナル**。
無駄な努力を回避させることが目的。
絵文字でパンチを効かせ、読者を飽きさせず、でも容赦なくぶった斬る。

以下の情報を基に分析してください：

・アプリ/サービス名: ${appName}
・業界/カテゴリ: ${industry}
・サービス概要: ${description}
・収益モデル: ${revenueModel}
・目標年間売上: ${targetRevenue}万円
・マーケティング戦略: ${marketingStrategy}
・事業開始からの期間: ${timeframe}
・初期投資予算: ${budget}万円

回答は以下の構成で：
【市場分析・競合評価】
【ビジネスモデル評価】
【マーケティング戦略診断】
【収益性・財務分析】
【リスク分析・警告】
【総合判定・改善提案】`;

    // OpenAI APIを呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      sendJson(500, { error: 'AI分析中にエラーが発生しました' });
      return;
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;
    
    // 成功レスポンス
    sendJson(200, { analysis: analysis });
    
  } catch (err) {
    console.error('サーバーエラー:', err);
    sendJson(500, { error: 'サーバーエラーが発生しました' });
  }
}
