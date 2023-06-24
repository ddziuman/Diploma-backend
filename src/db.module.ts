import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Region } from './entities/region';
import { District } from './entities/district';
import { City } from './entities/city';
import { SchoolAccount } from './entities/school-account';
import { User } from './user/user';
import { Class } from './entities/class';
import { PupilNotebook } from './entities/pupil-notebook';
import { NotebookPage } from './entities/notebook-page';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [
          Region,
          District,
          City,
          SchoolAccount,
          User,
          Class,
          PupilNotebook,
          NotebookPage
        ], // __dirname + '/entities/*.js'
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class DBModule {
  constructor() {}
}
