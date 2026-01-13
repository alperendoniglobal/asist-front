// PM2 ecosystem dosyası - Yol Asistan Frontend için
// Bu dosya PM2 ile frontend uygulamasını yönetmek için kullanılır
module.exports = {
  apps: [
    {
      name: 'yol-asist-frontend',
      script: '/usr/bin/serve',
      args: ['-s', 'dist', '-l', '5173', '-n'],
      cwd: '/var/www/asist-front',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
      // Log dosyaları
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Otomatik restart ayarları
      watch: false,
      max_memory_restart: '500M',
      // Crash durumunda otomatik restart
      autorestart: true,
      // Restart gecikmesi (ms)
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown için bekleme süresi
      kill_timeout: 5000,
      // Uptime monitoring
      listen_timeout: 10000,
    },
  ],
};
