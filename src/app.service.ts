import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Goooooooood mnnnorrniiiing Ukraine 123!!!';
  }
}
