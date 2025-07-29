export default async function handler(req, res) {
  // CORS設定（重要）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POSTメソッドのみ受付
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POSTメソッドのみ対応' });
  }

  try {
    const { 
      appName, 
      industry, 
      description, 
      revenueModel, 
      targetRevenue, 
      marketingStrategy, 
      timeframe, 
      budget 
    } = req.body;

    // 入力チェック
    if (!appName || !industry || !description) {
      return res.status(400).json({ 
        error: '必須項目が入力されていません' 
      });
    }

    // OpenAI API呼び出し
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'あなたは経験豊富なビジネスコンサルタントで、スタートアップから大企業まで幅広い企業の戦略立案を支援してきました。データドリブンな分析と実践的なアドバイスを提供します。'
          },
          {
            role: 'user',
            content: `以下のビジネスプランを詳細に分析し、包括的なレポートを作成してください。

【分析対象】
・サービス名: ${appName}
・業界: ${industry}
・サービス概要: ${description}
・収益モデル: ${revenueModel}
・目標年間売上: ${targetRevenue}万円
・マーケティング戦略: ${marketingStrategy}
・開発段階: ${timeframe}
・初期投資予算: ${budget}万円

以下の観点から分析し、各セクション500-800文字程度で詳細にレポートしてください：

1. 【市場分析・競合評価】
- 市場規模とトレンド
- 主要競合の状況
- 市場での差別化ポイント

2. 【ビジネスモデル評価】
- 収益モデルの妥当性
- 収益化までのタイムライン
- スケーラビリティの評価

3. 【マーケティング戦略分析】
- 提案された戦略の効果性
- 顧客獲得コスト (CAC) の予測
- 改善提案

4. 【財務予測・収益分析】
- 売上目標の達成可能性
- 損益分岐点の予測
- 資金調達の必要性

5. 【リスク分析・課題】
- 主要なリスク要因
- 技術的・市場的課題
- 法規制や競合リスク

6. 【成長戦略・推奨アクション】
- 短期・中期・長期の戦略
- 具体的なアクションプラン
- KPI設定の提案

各セクションは実用的で具体的な内容にし、数値的な根拠も含めてください。`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return res.status(500).json({ 
        error: 'AI分析中にエラーが発生しました。しばらく後に再試行してくだ
