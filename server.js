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
  'nezvano',
  'makarunee',
  'awiona',
  'ezhanna',
  'myakoto_',
  'sSharkShoals',
  'cerubervt',
  'libertina98',
  'vasyato4ka',
  'mordch',
  'camiavt',
  'amity_weiss',
  'ruf_alester',
  'mikichvt',
  'hotbeatstv',
  'hard_music_tv',
  'violit_tv',
  'egorkreed',
  'ishowspeed',
  'ironmouse'
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
        body { 
          background: #FFFFFF; 
          display: flex; 
          justify-content: center; 
          padding: 16px; 
          overflow: hidden;
        }
        
        .container { 
          max-width: 1200px; 
          width: 100%; 
        }
        
        .header { 
          color: #000000; 
          font-size: 22px; 
          font-weight: 700; 
          margin-bottom: 16px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }
        .header span { 
          background: #9147ff; 
          color: white;
          padding: 2px 14px; 
          border-radius: 20px; 
          font-size: 14px; 
        }
        .refresh-btn {
          background: #9147ff; 
          color: white; 
          border: none; 
          padding: 6px 18px;
          border-radius: 8px; 
          cursor: pointer; 
          font-weight: 600; 
          font-size: 13px;
          transition: 0.2s;
        }
        .refresh-btn:hover { background: #772ce8; }
        
        .scroll-container {
          overflow-x: auto;
          overflow-y: hidden;
          white-space: nowrap;
          padding: 8px 0 16px 0;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          display: flex;
          gap: 14px;
        }
        
        .scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #9147ff;
          border-radius: 10px;
        }
        
        .streamer-card {
          display: inline-block;
          width: 200px;
          min-width: 200px;
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: 0.3s;
          border: 1px solid #e8e8e8;
          vertical-align: top;
          white-space: normal;
          margin-right: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .streamer-card:hover {
          transform: translateY(-4px);
          border-color: #9147ff;
          box-shadow: 0 8px 25px rgba(145, 71, 255, 0.15);
        }
        
        .avatar {
          width: 100%;
          height: 200px;
          background: #f5f5f5;
          overflow: hidden;
          flex-shrink: 0;
        }
        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .info {
          padding: 10px 12px 14px;
          background: #FFFFFF;
        }
        .name {
          font-weight: 700;
          font-size: 15px;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .name small {
          font-weight: 400;
          color: #888;
          font-size: 12px;
          margin-left: 4px;
        }
        .game {
          color: #9147ff;
          font-size: 13px;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stats {
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .viewers {
          color: #666;
          font-size: 13px;
        }
        .live-time {
          color: #9147ff;
          font-size: 12px;
          font-weight: 500;
        }
        
        .loading { color: #666; text-align: center; padding: 40px; }
        .error { color: #ff6b6b; text-align: center; padding: 40px; }
        .offline { color: #666; text-align: center; padding: 40px; font-size: 18px; }
        .footer { 
          margin-top: 16px; 
          text-align: center; 
          color: #aaa; 
          font-size: 12px; 
        }
        
        /* ============================================
           👇 НОВЫЙ БЕЙДЖ "ЭФИР" вместо нумерации
           ============================================ */
        .live-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff0040;
          color: white;
          padding: 4px 12px 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.5px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 12px rgba(255, 0, 64, 0.4);
          text-transform: uppercase;
        }
        /* Красная точка */
        .live-badge::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        
        .card-wrapper {
          position: relative;
          display: inline-block;
          vertical-align: top;
          white-space: normal;
          margin-right: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>🟣 В ЭФИРЕ СЕЙЧАС <span id="count">0</span></div>
          <button class="refresh-btn" onclick="loadStreamers()">⟳ Обновить</button>
        </div>
        
        <div class="scroll-container" id="streamerList">
          <div class="loading">⏳ Загрузка...</div>
        </div>
        
        <div class="footer">Данные обновляются автоматически каждые 2 минуты</div>
      </div>
      
      <script>
        async function loadStreamers() {
          const container = document.getElementById('streamerList');
          container.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
          
          try {
            const res = await fetch('/api/streamers');
            if (!res.ok) throw new Error('Ошибка сервера: ' + res.status);
            const data = await res.json();
            
            document.getElementById('count').textContent = data.length;
            
            if (data.length === 0) {
              container.innerHTML = '<div class="offline">😴 Сейчас никто не стримит из списка</div>';
              return;
            }
            
            let html = '';
            data.forEach((stream) => {
              const viewerText = stream.viewers > 0 ? \`👁️ \${stream.viewers}\` : '👁️ 0';
              html += \`
                <div class="card-wrapper">
                  <div class="live-badge">ЭФИР</div>
                  <div class="streamer-card" onclick="window.open('https://twitch.tv/\${stream.login}', '_blank')">
                    <div class="avatar">
                      <img src="\${stream.avatar}" alt="\${stream.login}" onerror="this.src='https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe4b5d9d0-profile_image-50x50.png'">
                    </div>
                    <div class="info">
                      <div class="name">\${stream.login} <small>\${stream.display_name}</small></div>
                      <div class="game">🎮 \${stream.game || 'Не указана'}</div>
                      <div class="stats">
                        <span class="viewers">\${viewerText}</span>
                        <span class="live-time">🟣 \${stream.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              \`;
            });
            
            container.innerHTML = html;
          } catch (e) {
            container.innerHTML = \`<div class="error">❌ Ошибка: \${e.message}</div>\`;
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
