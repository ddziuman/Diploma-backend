import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './controllers/user.controller';
import { User } from 'src/user/user';
import { UserService } from './services/user.service';
import { CityService } from 'src/services/city/city.service';
import { DistrictService } from 'src/services/district/district.service';
import { RegionService } from 'src/services/region/region.service';
import { SchoolAccountService } from 'src/services/school-account/school-account.service';
import { Region } from 'src/entities/region';
import { District } from 'src/entities/district';
import { City } from 'src/entities/city';
import { SchoolAccount } from 'src/entities/school-account';
import { Class } from 'src/entities/class';
import { NotebookPage } from 'src/entities/notebook-page';
import { PupilNotebook } from 'src/entities/pupil-notebook';
import { PupilNotebookService } from 'src/services/pupil-notebook.service';
import { NotebookController } from 'src/controllers/notebook.controller';
import { ClassService } from 'src/services/class/class.service';
import { ClassController } from 'src/controllers/class/class.controller';
import { JwtService } from '@nestjs/jwt';
import { SubjectsController } from 'src/controllers/subject/subjects.controller';
import { Subject } from 'src/entities/subject';
import { SubjectService } from 'src/services/subject.service';
import { TeacherController } from './controllers/teacher.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ScheduleItem } from 'src/entities/schedule';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from 'src/services/schedule/schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      User,
      Region,
      District,
      City,
      SchoolAccount,
      User,
      PupilNotebook,
      NotebookPage,
      Subject,
      ScheduleItem,
    ]),
    MailerModule.forRoot({
      transport: {
        host: 'smtps://user@domain.com:pass@smtp.domain.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: 'oleksandr.soluian@gmail.com',
          pass: '456jkl8910',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@gmail.com>',
      },
      preview: false,
      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
  ],
  providers: [
    SubjectService,
    UserService,
    RegionService,
    DistrictService,
    CityService,
    SchoolAccountService,
    PupilNotebookService,
    ClassService,
    JwtService,
    ScheduleService,
  ],
  controllers: [
    UserController,
    ScheduleController,
    TeacherController,
    NotebookController,
    ClassController,
    SubjectsController,
  ],
  exports: [
    UserService,
    RegionService,
    DistrictService,
    CityService,
    SchoolAccountService,
    PupilNotebookService,
  ],
})
export class UserModule {}
