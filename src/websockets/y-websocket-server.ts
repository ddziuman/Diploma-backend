import { WsAdapter } from '@nestjs/platform-ws';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Request, raw } from 'express';
import { PupilNotebookService } from 'src/services/pupil-notebook.service';
import { Server } from 'ws';
import { setupWSConnection, getYDoc } from 'y-websocket/bin/utils';
import * as Y from 'yjs';

interface UserInfo {
  userId: string;
  page: string;
}
@WebSocketGateway(3001, {
  transports: ['websocket'],
  cors: true,
  allowUpgrades: true,
})
export class YjsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private pupilNotebookService: PupilNotebookService) {
    this.clientsMap = new Map();
  }

  @WebSocketServer() server: Server;

  clientsMap: Map<WebSocket, UserInfo>;

  afterInit(server: Server) {}
  async handleConnection(
    connection: WebSocket,
    request: Request,
  ): Promise<void> {
    let queryParams: any = this.getAllQueryParams(request.url);

    this.clientsMap.set(connection, queryParams);

    let docName = `${queryParams.userId}doc1${queryParams.page}`;

    const ydoc = getYDoc(docName, true) as Y.Doc;

    setupWSConnection(connection, request, { docName, gc: true });
    let dbData = (
      await this.pupilNotebookService.getNotebookPageByUserId(
        '1',
        queryParams.page,
      )
    ).notebookPageByteArr;
    Y.transact(ydoc, () => {
      console.log('apply', dbData);
      Y.applyUpdate(ydoc, dbData);
    });
  }
  handleDisconnect(client: WebSocket) {
    let clientInfo = this.clientsMap.get(client);

    let doc = getYDoc(
      `${clientInfo.userId}doc1${clientInfo.page}`,
      true,
    ) as Y.Doc;

    this.pupilNotebookService.updateNotebookPage(
      parseInt(clientInfo.userId),
      Y.encodeStateAsUpdate(doc) as Buffer,
      parseInt(clientInfo.page),
    );
    this.clientsMap.delete(client);
  }

  handleUpgrade(request, socket, head) {
    this.server.handleUpgrade(request, socket, head, (ws) => {
      this.server.emit('connection', ws, request);
    });
  }

  getAllQueryParams(url: string) {
    let queryParams = {};
    let queryString = url.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach((param) => {
        let paramValueKey = param.split('=');
        let paramName = decodeURIComponent(paramValueKey[0]);
        let paramValue = decodeURIComponent(paramValueKey[1] || '');
        queryParams[paramName] = paramValue;
      });
    }
    return queryParams;
  }
}
