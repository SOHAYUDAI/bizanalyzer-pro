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
      targetRevenue,
      marketingStrategy,
      timeframe,
      budget
    } = body;
    
    // 必須項目チェック
    if (!appName || !industry || !description) {
      sendJson(400, { error: '必須項目が入力されていません' });
      return;
    }
    
    console.log(分析開始: ${appName} (${industry}));
    
    // 動的な分析結果を生成（入力データに基づく）
    const generateAnalysis = () => {
      const marketSizes = {
        'EC・ショッピング': '10兆円',
        '飲食・グルメ': '25兆円', 
        'ヘルスケア・フィットネス': '5兆円',
        '教育・学習': '3兆円',
        'エンターテイメント': '12兆円',
        'ビジネス・生産性': '8兆円',
        'SNS・コミュニケーション': '15兆円',
        '旅行・観光': '20兆円',
        '金融・フィンテック': '50兆円',
        '不動産・住宅': '40兆円',
        '美容・ファッション': '8兆円',
        'マッチング・出会い': '1兆円',
        'モビリティ・交通': '30兆円',
        '農業・食品': '100兆円',
        'その他': '5兆円'
      };
      
      const competitionLevels = {
        'EC・ショッピング': '激戦区（Amazon、楽天の牙城）',
        '飲食・グルメ': 'レッドオーシャン（食べログ、Uber Eats独占）',
        'ヘルスケア・フィットネス': '成長市場だが規制あり',
        '教育・学習': 'コロナ特需終了で厳しい現実',
        'エンターテイメント': 'TikTok、YouTubeが全て飲み込む',
        'ビジネス・生産性': 'Microsoft、Googleの独壇場',
        'SNS・コミュニケーション': 'Meta帝国に勝てるのか？',
        '旅行・観光': 'インバウンド頼みの不安定市場',
        '金融・フィンテック': '規制の嵐、PayPay・メルペイが席巻',
        '不動産・住宅': '少子高齢化で縮小市場',
        '美容・ファッション': 'インフルエンサー頼みの不安定性',
        'マッチング・出会い': 'Pairs、Tinderの牙城崩せず',
        'モビリティ・交通': 'Uber、DiDiの後追いでは厳しい',
        '農業・食品': '伝統的業界のDX抵抗勢力',
        'その他': '競合分析が不十分'
      };
      
      const revenueCritique = targetRevenue < 1000 ? 
        '**目標が低すぎて生存困難** 💀 この売上では人件費すら賄えません。' :
        targetRevenue > 10000 ?
        '**現実離れした目標設定** 🚀 宇宙を目指すのは結構だが、地球での実績は？' :
        '**まあまあ現実的な目標** 📊 達成可能性は戦略次第です。';
        
      const budgetCritique = budget < 100 ?
        '**予算不足で即死確定** 💸 この予算ではアルバイト1人も雇えません。' :
        budget > 5000 ?
        '**潤沢な資金、でも浪費リスク大** 💰 お金があるからといって成功するわけではない。' :
        '**適度な予算設定** 💼 使い方次第で化ける可能性あり。';

      return 【市場分析・競合評価】
**${industry}業界の現実を見よ！甘い夢は今すぐ捨てろ** 🎯
市場規模は約${marketSizes[industry] || '不明'}と巨大だが、${competitionLevels[industry] || '競合状況不明'}という厳しい現実。${appName}が参入するには、既存プレイヤーとの明確な差別化戦略が不可欠。単なる「便利なアプリ」では即座に埋もれる運命です。

ユーザー獲得コスト（CAC）は業界平均で1ユーザーあたり3,000-10,000円。${description}というコンセプトで、どうやって大手の広告予算に対抗するのか？口コミだけで広がると思っているなら、それは幻想です。

【ビジネスモデル評価】
**${revenueModel}モデル？99%が失敗する理由を教えてやる** 💼
${revenueModel}という収益モデルは一見魅力的だが、実際の成功例を見ると生存率は10%以下。特に${industry}業界では、ユーザーの支払い意欲が低く、マネタイズに苦戦する企業が続出しています。

${revenueCritique}

競合他社の財務データを見ると、黒字化まで平均3-5年、累積赤字は数億円レベル。${appName}にはその覚悟と資金調達能力がありますか？

【マーケティング戦略診断】
**その集客戦略、小学生でも騙されないレベル** 📢
「${marketingStrategy}」という戦略、聞こえは良いですが数字で検証しましょう。SNSマーケティングのエンゲージメント率は業界平均1-3%、広告のCTRは0.5%以下が現実。

インフルエンサーマーケティングも単発では効果薄。継続的な投資が必要で、月額数百万円の予算は覚悟すべき。口コミに期待するなら、バイラル要素の設計が必須ですが、${description}からは見えてきません。

【収益性・財務分析】
**数字が語る残酷な真実、現実逃避はやめろ** 📊
目標売上${targetRevenue}万円に対し、${industry}業界の平均利益率は15-25%。つまり粗利は${Math.round(targetRevenue * 0.2)}万円程度。そこから人件費、広告費、サーバー代等を差し引くと...現実は見えてきましたか？

初期投資${budget}万円の回収期間は、順調にいっても2-3年。しかし、${timeframe}という現在の状況を考えると、キャッシュフローの管理が生命線になります。

【リスク分析・警告】
**見落としがちな地雷原、踏んだら即死** ⚠️
1. **法的リスク**: ${industry}業界特有の規制変更リスク
2. **技術的リスク**: システム障害時の信頼失墜
3. **競合リスク**: 大手による模倣・買収攻勢
4. **市場リスク**: 消費者ニーズの急変
5. **財務リスク**: 予想以上の資金調達困難

特に${revenueModel}モデルでは、ユーザーの解約率（チャーンレート）が最大の敵。業界平均月間5-10%の解約率を前提とした事業計画が必要です。

【総合判定・改善提案】
**結論：このままでは確実に失敗、起死回生の一手はこれだ** 🚀

${appName}のアイデア自体に致命的な欠陥はありませんが、戦略の甘さが目立ちます。以下の改善なしには成功は困難：

✅ **必須改善点**:
- ユーザー獲得戦略の具体的数値目標設定
- 競合との明確な差別化ポイント確立  
- 財務計画の現実的再設計
- ${revenueModel}以外の収益源確保

🔥 **緊急対応**:
- MVP開発での小さな成功体験積み重ね
- ターゲット顧客100名への直接ヒアリング実施
- 月次KPI管理体制の構築

夢を語るのは自由ですが、現実と向き合う覚悟がなければ、${budget}万円をドブに捨てることになります。

**それでも挑戦する覚悟があるなら、今すぐ行動を起こせ。明日では遅い。** 🔥

Small Business Reviewより、愛ある辛口レビューでした。成功を祈る...わけではない。実力で勝ち取れ。;
    };
    
    const analysis = generateAnalysis();
    
    // 成功レスポンス
    console.log('分析完了:', appName);
    sendJson(200, { analysis: analysis });
    
  } catch (err) {
    console.error('サーバーエラー:', err);
    sendJson(500, { 
      error: 'サーバーエラーが発生しました',
      debug: err.message 
    });
  }
}
