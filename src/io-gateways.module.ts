/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { VoiceChatGateway } from './websockets/voice-chat';

@Module({
  imports: [],
  controllers: [],
  providers: [VoiceChatGateway],
})
export class IoGatewaysModule {}
