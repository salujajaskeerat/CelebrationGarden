// PM2 Ecosystem Configuration
// This file manages both Strapi and Next.js applications
// Run with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/var/www/celebration-garden-cms',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 1337,
      },
      error_file: '/var/log/pm2/strapi-error.log',
      out_file: '/var/log/pm2/strapi-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'nextjs',
      cwd: '/var/www/celebration-garden',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/nextjs-error.log',
      out_file: '/var/log/pm2/nextjs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '400M',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};

