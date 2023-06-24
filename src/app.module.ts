import { ScheduleController } from './user/controllers/schedule.controller';
import { PupilController } from './user/controllers/pupil.controller';
import { TeacherController } from './user/controllers/teacher.controller';
import { PupilNotebookService } from './services/pupil-notebook.service';
import { DBModule } from './db.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { YjsGateway } from './websockets/y-websocket-server';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { YjsPaintGateway } from './websockets/y-websocket-share-paint';
import { SchoolAccountController } from './controllers/school-account/school-account.controller';
import { PupilNotebook } from './entities/pupil-notebook';
import { NotebookPage } from './entities/notebook-page';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.dbEnv',
    }),
    DBModule,
    TypeOrmModule.forFeature([PupilNotebook, NotebookPage]),
    UserModule,
    AuthModule,
  ],
  controllers: [
    PupilController,
    TeacherController,
    SchoolAccountController,
    AppController,
  ],
  providers: [
    PupilNotebookService,
    AppService,
    JwtService,
    YjsGateway,
    YjsPaintGateway,
  ],
})
export class AppModule {}
