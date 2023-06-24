import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { PeerServer } from 'peer';
import { IoGatewaysModule } from './io-gateways.module';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useWebSocketAdapter(new WsAdapter(app));

  const app2 = await NestFactory.create(IoGatewaysModule, { cors: true });
  app2.useWebSocketAdapter(
    new IoAdapter({
      cors: true,
    }),
  );

  app.enableCors();

  const peer = PeerServer({
    port: 3003,
    path: '/',
  });

  await app.listen(3000);
  await app2.listen(3002);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
