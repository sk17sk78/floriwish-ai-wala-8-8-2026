module.exports = {
  apps: [{
    name: 'floriwish',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '800M',
    node_args: ['--max-old-space-size=1024'],
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
