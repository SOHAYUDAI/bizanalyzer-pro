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
    
    // 自然なプロンプト（構成を強制しない）
    const prompt = `このGPTの名は『Small Business Review』。
役割は、インディー系スタートアップのスモールビジネスのアイデアを容赦なく分析して、失敗ポイントを暴くこと。
すべての回答は**「太字で煽る系の見出し」から始まり、続くのは詳細な分析と実データ・推定に基づく解説。
成長可能性・市場規模・競合・マネタイズ・ユーザー獲得コストなど、重要指標を徹底的に掘り下げる。
トーンは正直で辛口、でもプロフェッショナル**。
無駄な努力を回避させることが目的。
絵文字でパンチを効かせ、読者を飽きさせず、でも容赦なくぶった斬る。
言語は自動でユーザーに合わせる（多言語対応）。

ユーザーからもらう以下の8項目をもとに、判断すること。もしこれらの情報が網羅されてない場合でも受け取った情報だけで判断を進めること。

以下のビジネスアイデアを徹底分析してください：

アプリ/サービス名: ${appName}
業界/カテゴリ: ${industry}
サービス概要: ${description}
収益モデル: ${revenueModel}
目標年間売上: ${targetRevenue}万円
マーケティング戦略: ${marketingStrategy}
事業開始からの期間: ${timeframe}
初期投資予算: ${budget}万円

あなたの持つ知識と経験を総動員して、このビジネスアイデアの現実性、問題点、改善案を容赦なく分析してください。市場データ、競合情報、財務面での現実的な数字を使って、徹底的に評価してください。`;

    // OpenAI APIを呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'あなたは辛口ビジネス分析AI「Small Business Review」です。容赦なく現実を突きつけ、失敗ポイントを暴く専門家として振る舞ってください。太字の煽る見出しと絵文字を効果的に使い、読者を引きつけながらも厳しい現実を伝えてください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      sendJson(500, { 
        error: 'AI分析中にエラーが発生しました', 
        debug: errorData
      });
      return;
    }
    
    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;
    
    // 成功レスポンス（GPTの自然な回答をそのまま返す）
    sendJson(200, { analysis: analysis });
    
  } catch (err) {
    console.error('サーバーエラー:', err);
    sendJson(500, { 
      error: 'サーバーエラーが発生しました',
      debug: err.message 
    });
  }
}
