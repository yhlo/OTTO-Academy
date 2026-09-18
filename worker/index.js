// Worker 進入點：/api/chat 交給 AI 小幫手邏輯處理，其餘路徑一律回傳靜態網站檔案。
import { handleChatRequest, jsonResponse } from './chat.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') {
        return jsonResponse({ error: '請使用 POST 方法' }, 405);
      }
      return handleChatRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
