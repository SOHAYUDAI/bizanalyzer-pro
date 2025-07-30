import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  function sendJson(status, data) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(data));
  }

  if (req.method === 'OPTIONS') {
    sendJson(200, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(405, { error: 'POSTメソッドのみ対応' });
    return;
  }

  try {
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
      targetRevenue,
      marketingStrategy,
      timeframe,
      budget,
    } = body;

    if (!appName || !industry || !description) {
      sendJson(400, { error: '必須項目が入力されていません' });
      return;
    }

    console.log(`分析開始: ${appName} (${industry})`);

    const prompt = `
このGPTの名は『Small Business Review』。
あなたは以下の8項目を元にスモールビジネスのアイデアを辛口かつプロフェッショナルに評価するAIです。
評価は以下の構造で必ずJSON形式で出力してください：

{
  "市場分析・競合評価": "...",
  "ビジネスモデル評価": "...",
  "マーケティング戦略診断": "...",
  "収益性・財務分析": "...",
  "リスク分析・警告": "...",
  "総合判定・改善提案": "..."
}

**見出しは煽る系で、詳細は分析と数字に基づく辛口解説にしてください。太字も絵文字も歓迎。**

以下がユーザーの入力情報です：
・アプリ/サービス名: ${appName}
・業界/カテゴリ: ${industry}
・サービス概要: ${description}
・収益モデル: ${revenueModel}
・目標年間売上（万円）: ${targetRevenue}
・マーケティング戦略: ${marketingStrategy}
・事業開始からの期間: ${timeframe}
・初期投資予算（万円）: ${budget}
`;

    const gptResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a brutally honest but professional startup evaluator AI named "Small Business Review".',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const responseText = gptResponse.data.choices[0].message.content;

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (err) {
      console.error('JSONパース失敗:', err.message);
      sendJson(500, {
        error: 'GPTの出力がJSON形式として解析できませんでした',
        raw: responseText,
      });
      return;
    }

    console.log('分析完了:', appName);
    sendJson(200, result);
  } catch (err) {
    console.error('サーバーエラー:', err);
    sendJson(500, {
      error: 'サーバーエラーが発生しました',
      debug: err.message,
    });
  }
}
