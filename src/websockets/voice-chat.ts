import { IoAdapter } from '@nestjs/platform-socket.io';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3004, {
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  allowUpgrades: true,
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class VoiceChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private rooms: Map<string, Set<{ socketId: string; userId: string }>> =
    new Map();

  constructor() {}
  async handleConnection(socket: Socket) {
    console.log('client connected');
  }

  async handleDisconnect(socket: Socket) {
    console.log('client disconnected');
  }

  @SubscribeMessage('join-room')
  async onJoinRoom(socket: any, data: { roomId: string; userId: string }) {
    const { roomId, userId } = data;
    socket.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    const users = this.rooms.get(roomId);
    users.add({ socketId: socket.id, userId: userId });
    this.rooms.set(roomId, users);
    console.log(this.rooms);

    this.server.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      if (this.rooms.has(roomId)) {
        const users = this.rooms.get(roomId);

        users.forEach((user) => {
          if (user.socketId === socket.id) {
            users.delete(user);
          }
        });
        this.rooms.set(roomId, users);
      }
      console.log(this.rooms);
      this.server.to(roomId).emit('user-disconnected', userId);
    });
  }

  @SubscribeMessage('toggle-micro')
  async toggleMicro(
    socket: any,
    data: { roomId: string; userId: string; isMicroEnabled: true },
  ) {
    let { roomId, userId, isMicroEnabled } = data;

    if (this.rooms.has(roomId)) {
      socket.to(roomId).emit('micro-toggled', { userId, isMicroEnabled });
    }
  }

  @SubscribeMessage('stop-screen-sharing')
  async shareScreen(socket: any, data: { roomId: string }) {
    let { roomId } = data;

    if (this.rooms.has(roomId)) {
      socket.to(roomId).emit('screen-shared');
    }
  }
}
