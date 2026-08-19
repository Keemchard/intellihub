// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "intellihub",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3002,
        NODE_ENV: "production"
      }
    }
  ]
};