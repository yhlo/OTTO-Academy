// AI 小幫手的問答邏輯，被 worker/index.js 的 /api/chat 路由呼叫。
// 用 Cloudflare Workers AI 的免費額度跑一個小型 LLM。
// 需要在 wrangler.jsonc 設定 ai binding（變數名稱 AI），本機端不需要任何 API key。

const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const MAX_MESSAGE_LENGTH = 300;
const MAX_HISTORY_TURNS = 6;

const SYSTEM_PROMPT = `你是 OTTO Academy 沃稌專業家教官網上的線上小幫手，個性親切、簡潔、專業。
只根據以下資訊回答問題，不要編造課程、老師或價格等未提及的細節：

【關於我們】
OTTO Academy 是來自台灣大學的家教團隊，由台大畢業學生組成，提供一對一到小班制的客製化國高中學科輔導與國外學制補強，依學生需求打造最合適的學習形式。

【常見問題】
Q: 是否可提供試教課程？
A: 可以，提供試教機會，歡迎填寫線上報名表單或加入 LINE 官方帳號預約。

Q: 試教如何進行？
A: 提供一次 1.5 小時的試教服務，老師會評估學生的學習狀況與弱項，並說明客製化學習方案。

Q: 課程是一對一還是小班制？
A: 兩種都有，一對一適合完全客製化進度，小班制適合同學或親友組班共學、學費分攤更彈性，可在報名表單或 LINE 告知需求。

Q: 上課時間怎麼安排？
A: 提供平日晚上與週末白天的彈性時段，媒合成功後由學生與老師直接協調每週上課時間。

Q: 課程內容會依照學校進度調整嗎？
A: 會，課程設計完全配合學生學校的教學版本、段考範圍與複習日程。

Q: 缺課可以補課嗎？
A: 可以，提供彈性補課，線上課程部分老師也提供錄影回放。

Q: 學費怎麼收費？
A: 依學生年級、科目困難度與老師資歷而不同，詳細報價需透過 LINE 聯絡。

【授課科目】英文、數學、物理、化學、生物、地球科學

【聯絡方式】
- 立即預約試教表單：https://forms.gle/AUhMfD6uDnYfLH2t8
- LINE 官方帳號：https://lin.ee/pSkiQnX
- Email：learnwithotto@gmail.com

回答規則：
1. 用繁體中文回答，語氣自然、簡短，2-4 句話內講完，不要條列一大串。
2. 遇到明確報價、特定老師媒合、付款等需要真人確認的問題，引導對方透過 LINE 官方帳號聯絡，並附上連結。
3. 如果問題與家教服務完全無關，禮貌地說明你只能協助 OTTO Academy 相關的問題。
4. 不要自稱是 Claude、Llama 或任何模型名稱，就說自己是「OTTO 小幫手」。`;

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function handleChatRequest(request, env) {
  if (!env.AI) {
    return jsonResponse(
      { error: 'AI 小幫手尚未設定，請透過 LINE 官方帳號聯絡我們。' },
      500
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '請求格式錯誤' }, 400);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return jsonResponse({ error: '請輸入問題內容' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ error: `問題請控制在 ${MAX_MESSAGE_LENGTH} 字以內` }, 400);
  }

  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history = rawHistory
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .slice(-MAX_HISTORY_TURNS * 2)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const result = await env.AI.run(MODEL, {
      messages,
      max_tokens: 400,
    });

    const reply =
      result && typeof result.response === 'string' && result.response.trim()
        ? result.response.trim()
        : '不好意思，我暫時無法回答這個問題，歡迎直接透過 LINE 官方帳號聯絡我們：https://lin.ee/pSkiQnX';

    return jsonResponse({ reply });
  } catch (err) {
    return jsonResponse(
      { error: 'AI 小幫手暫時無法使用，歡迎透過 LINE 官方帳號聯絡我們。' },
      502
    );
  }
}
