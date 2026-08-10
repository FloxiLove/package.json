const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 👇 СЮДА ВСТАВЬ СВОИ ДАННЫЕ ОТ TWITCH
// ============================================
const CLIENT_ID = 'ib6mkjyyyrw1v3rtjchrorzlhjhb85';  // Твой Client ID
const ACCESS_TOKEN = 'ibk2h50iauoabwnunpg5tgfcnte2cp';  // Твой Access Token

// ============================================
// 👇 ТОЛЬКО ЭТИ ТРИ СТРИМЕРА (остальные удалены)
// ============================================
const STREAMERS = [
  'foksyq',
  'theiathedraco',
  'honya_vt'
  'dmitry_bale'
];
// ============================================

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Онлайн стримеры</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
        body { background: #0e0e10; display: flex; justify-content: center; padding: 20px; }
        .container { max-width: 800px; width: 100%; }
        .header { color: #efeff1; font-size: 24px; font-weight: 700; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .header span { background: #9147ff; padding: 2px 12px; border-radius: 20px; font-size: 14px; }
        .streamer-card {
          background: #1f1f23; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;
          display: flex; align-items: center; gap: 15px; color: #efeff1;
          cursor: pointer; transition: 0.2s; border-left: 4px solid #9147ff;
        }
        .streamer-card:hover { background: #2a2a2e; transform: translateX(4px); }
        .rank { font-weight: 700; color: #adadb8; width: 30px; font-size: 18px; }
        .avatar { width: 50px; height: 50px; border-radius: 50%; background: #3a3a3e; overflow: hidden; flex-shrink: 0; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .info { flex: 1; }
        .name { font-weight: 600; font-size: 16px; }
        .name small { font-weight: 400; color: #adadb8; font-size: 13px; margin-left: 8px; }
        .game { color: #adadb8; font-size: 14px; margin-top: 2px; }
        .stats { text-align: right; flex-shrink: 0; }
        .viewers { color: #adadb8; font-size: 14px; }
        .live-time { color: #9147ff; font-size: 13px; font-weight: 500; }
        .search-bar {
          background: #18181b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;
          color: #adadb8; display: flex; justify-content: space-between; border: 1px solid #2a2a2e;
        }
        .badge { background: #9147ff; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
        .loading { color: #adadb8; text-align: center; padding: 40px; }
        .error { color: #ff6b6b; text-align: center; padding: 40px; }
        .offline { color: #adadb8; text-align: center; padding: 40px; font-size: 18px; }
        .refresh-btn {
          background: #9147ff; color: white; border: none; padding: 8px 20px;
          border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;
        }
        .refresh-btn:hover { background: #772ce8; }
        .footer { margin-top: 20px; text-align: center; color: #adadb8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>🟣 В ЭФИРЕ СЕЙЧАС <span id="count">0</span></div>
          <button class="refresh-btn" onclick="loadStreamers()">⟳ Обновить</button>
        </div>
        <div class="search-bar">
          <span>🔍 Стримеры из списка</span>
          <span>Сортировка по зрителям</span>
        </div>
        <div id="streamerList"><div class="loading">⏳ Загрузка...</div></div>
        <div class="footer">Данные обновляются автоматически каждые 2 минуты</div>
      </div>
      <script>
        async function loadStreamers() {
          const list = document.getElementById('streamerList');
          list.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
          
          try {
            const res = await fetch('/api/streamers');
            if (!res.ok) throw new Error('Ошибка сервера: ' + res.status);
            const data = await res.json();
            
            document.getElementById('count').textContent = data.length;
            
            if (data.length === 0) {
              list.innerHTML = '<div class="offline">😴 Сейчас никто не стримит из списка</div>';
              return;
            }
            
            let html = '';
            data.forEach((stream, index) => {
              const viewerText = stream.viewers > 0 ? \`👁️ \${stream.viewers}\` : '👁️ 0';
              html += \`
                <div class="streamer-card" onclick="window.open('https://twitch.tv/\${stream.login}', '_blank')">
                  <div class="rank">\${index + 1}</div>
                  <div class="avatar"><img src="\${stream.avatar}" alt="\${stream.login}" onerror="this.src='https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe4b5d9d0-profile_image-50x50.png'"></div>
                  <div class="info">
                    <div class="name">\${stream.login} <small>\${stream.display_name}</small></div>
                    <div class="game">🎮 \${stream.game || 'Не указана'}</div>
                  </div>
                  <div class="stats">
                    <div class="viewers">\${viewerText}</div>
                    <div class="live-time">🟣 идет \${stream.time}</div>
                  </div>
                </div>
              \`;
            });
            list.innerHTML = html;
          } catch (e) {
            list.innerHTML = \`<div class="error">❌ Ошибка: \${e.message}<br><small>Проверь токен и список стримеров</small></div>\`;
            console.error(e);
          }
        }
        
        loadStreamers();
        setInterval(loadStreamers, 120000);
      </script>
    </body>
    </html>
  `);
});

app.get('/api/streamers', async (req, res) => {
  try {
    // Получаем ID пользователей
    const userRes = await axios.get(
      `https://api.twitch.tv/helix/users?login=${STREAMERS.join('&login=')}`,
      { headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );
    const users = userRes.data.data;
    const userIds = users.map(u => u.id);

    // Получаем информацию о стримах
    const streamRes = await axios.get(
      `https://api.twitch.tv/helix/streams?user_id=${userIds.join('&user_id=')}`,
      { headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );

    // Сортируем по зрителям (по убыванию)
    const online = streamRes.data.data.sort((a, b) => b.viewer_count - a.viewer_count);

    const result = online.map(stream => {
      const user = users.find(u => u.id === stream.user_id);
      const started = new Date(stream.started_at);
      const now = new Date();
      const diffMs = now - started;
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeStr = '';
      if (diffHrs > 0) timeStr += `${diffHrs}ч `;
      timeStr += `${diffMins}м`;

      return {
        login: stream.user_login,
        display_name: stream.user_name,
        game: stream.game_name || 'Не указана',
        viewers: stream.viewer_count || 0,
        time: timeStr,
        avatar: user?.profile_image_url || ''
      };
    });

    res.json(result);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log('🚀 Сервер запущен на порту', PORT));
