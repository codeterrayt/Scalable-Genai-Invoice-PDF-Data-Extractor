module.exports = {
  apps: [
    {
      name: 'app-dev',
      script: 'node',
      args: '--env-file=.env index.js',
      watch: false,
    },
    {
      name: 'app-worker',
      script: 'node',
      args: '--env-file=.env worker/file.worker.js',
      exec_mode: 'fork',
      instances: 10,
      watch: false,
    }
  ]
};
