import { WsAdapter } from '@nestjs/platform-ws';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Request } from 'express';
import { Server } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

@WebSocketGateway(3007, {
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  allowUpgrades: true,
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class YjsPaintGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {}
  async handleConnection(
    connection: WebSocket,
    request: Request,
  ): Promise<void> {
    setupWSConnection(connection, request, { docName: 'test', gc: true });
  }
  handleDisconnect(client: WebSocket) {}

  handleUpgrade(request, socket, head) {
    this.server.handleUpgrade(request, socket, head, (ws) => {
      this.server.emit('connection', ws, request);
    });
  }
}
