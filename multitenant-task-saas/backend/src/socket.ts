import { Server } from 'socket.io';

export let io: Server;

export function initSocket(server: any) {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
  });
  io.on('connection', (socket) => {
    socket.on('tenant.join', (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
    });
    socket.on('ping', () => socket.emit('pong'));
  });
  return io;
}
