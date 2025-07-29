export default async function handler(request, response) {
  // CORS 対応
  if (request.method === 'OPTIONS') {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    response.writeHead(405, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'POSTメソッドのみ対応' }));
    return;
  }

  // Bodyを手動で読み込む
  const buffers = [];
  for await (const chunk of request) {
    buffers.push(chunk);
  }
  const bodyText = Buffer.concat(buffers).toString();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch (e) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'リクエストボディが不正です' }));
    return;
  }

  const { appName, industry, description } = body;
  if (!appName || !industry || !description) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: '必須項目が入力されていません' }));
    return;
  }

  // 仮の応答
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify({ message: '成功', received: body }));
}
