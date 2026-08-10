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
// 👇 ТОЛЬКО ТВОИ СТРИМЕРЫ
// ============================================
const STREAMERS = [
  'foksyq',
  'theiathedraco',
  'honya_vt',
  'supercrastan',
  'ej_sa'
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
        body { background: #FFFFFF; display: flex; justify-content: center; padding: 10px; }
        .container { max-width: 800px; width: 100%; }
        .header { color: #000000; font-size: 20px; font-weight: 700; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
        .header span { background: #9147ff; color: white; padding: 2px 12px; border-radius: 20px; font-size: 14px; }
        
        .streamer-card {
          background: #FFFFFF; border-radius: 12px; padding: 16px; margin-bottom: 10px;
          display: flex; align-items: center; gap: 20px; color: #000000;
          cursor: pointer; transition: 0.2s; border: 1px solid #e0e0e0;
        }
        .streamer-card:hover { background: #f5f5f5; }
        
        .rank { font-weight: 700; color: #9147ff; width: 30px; font-size: 18px; }
        
        .avatar { 
          width: 200px; 
          height: 200px; 
          flex-shrink: 0; 
          overflow: hidden; 
          border-radius: 8px; 
          background: #f0f0f0;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .info { flex: 1; }
        .name { font-weight: 600; font-size: 18px; color: #000000; }
        .name small { font-weight: 400; color: #666; font-size: 14px; margin-left: 8px; }
        .game { color: #9147ff; font-size: 15px; margin-top: 4px; }
        .stats { text-align: right; flex-shrink: 0; }
        .viewers { color: #666; font-size: 14px; }
        .live-time { color: #9147ff; font-size: 13px; font-weight: 500; }
        
        .loading { color: #666; text-align: center; padding: 40px; }
        .error { color: #ff6b6b; text-align: center; padding: 40px; }
        .offline { color: #666; text-align: center; padding: 40px; font-size: 18px; }
        .refresh-btn {
          background: #9147ff; color: white; border: none; padding: 6px 16px;
          border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;
        }
        .refresh-btn:hover { background: #772ce8; }
        .footer { margin-top: 20px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>🟣 В ЭФИРЕ СЕЙЧАС <span id="count">0</span></div>
          <button class="refresh-btn" onclick="loadStreamers()">⟳ Обновить</button>
        </div>
        <!-- 👇 СТРОКА ПОИСКА УДАЛЕНА! -->
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
    const userRes = await axios.get(
      `https://api.twitch.tv/helix/users?login=${STREAMERS.join('&login=')}`,
      { headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );
    const users = userRes.data.data;
    const userIds = users.map(u => u.id);

    const streamRes = await axios.get(
      `https://api.twitch.tv/helix/streams?user_id=${userIds.join('&user_id=')}`,
      { headers: { 'Client-ID': CLIENT_ID, 'Authorization': `Bearer ${ACCESS_TOKEN}` } }
    );

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
