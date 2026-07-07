module.exports = {
  apps: [
    {
      name: "dreamweaver",
      script: "server.js",
      cwd: "/var/www/dreamweaver/.next/standalone",
      env_file: "/var/www/dreamweaver/.env",
      instances: 1,
      autorestart: true,
      max_memory_restart: "600M",
    },
  ],
};
