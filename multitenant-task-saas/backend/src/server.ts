import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectRedis } from './config/redis.js';
import { initSocket } from './socket.js';

async function start() {
  await connectRedis();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(env.port, () => console.log(`Backend listening on ${env.port}`));
}

start();
