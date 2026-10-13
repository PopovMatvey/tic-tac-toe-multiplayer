const path = require('path');

const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'tic-tac-toe-server',
      cwd: path.join(root, 'server'),
      script: 'npm',
      args: 'run start:dev',
      interpreter: 'none',
      autorestart: true,
      watch: false,
    },
    {
      name: 'tic-tac-toe-client',
      cwd: path.join(root, 'client'),
      script: 'npm',
      args: 'start',
      interpreter: 'none',
      autorestart: true,
      watch: false,
    },
  ],
};
