module.exports = {
  apps: [{
    name: 'scrum-coach-backend',
    script: 'npm',
    args: 'run dev',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false, // Disable file watching in production
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Error handling
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    
    // Auto-restart configuration
    restart_delay: 4000,
    min_uptime: '10s',
    max_restarts: 10,
    
    // Monitoring
    monitoring: false,
    
    // Advanced PM2 features
    exec_mode: 'fork',
    
    // Health check
    health_check_grace_period: 3000,
    
    // Restart conditions
    ignore_watch: [
      'node_modules',
      'logs',
      '.git',
      'prisma/dev.db'
    ]
  }]
};