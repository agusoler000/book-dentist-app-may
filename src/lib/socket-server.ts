import { Server as IOServer } from 'socket.io';

// Declaración global para evitar errores de tipo
declare global {
  // eslint-disable-next-line no-var
  var io: IOServer | undefined;
}

export function getIO(res?: any) {
  // @ts-ignore
  if (globalThis.io) return globalThis.io as IOServer;
  if (res && res.socket && !res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    // @ts-ignore
    globalThis.io = io;
    res.socket.server.io = io;
    return io;
  }
  return null;
} 