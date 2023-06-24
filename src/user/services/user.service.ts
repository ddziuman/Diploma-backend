import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  In,
  IsNull,
  Not,
  QueryBuilder,
  SelectQueryBuilder,
} from 'typeorm';

import { User } from 'src/user/user';
import { Repository, FindOptionsWhere } from 'typeorm';
import {
  Observable,
  from,
  switchMap,
  of,
  map,
  tap,
  forkJoin,
  firstValueFrom,
} from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import {
  userDto,
  SchoolAccountDto,
} from 'src/controllers/school-account/school-account.controller';
import { SchoolAccount } from 'src/entities/school-account';
import { DistrictService } from 'src/services/district/district.service';
import { CityService } from 'src/services/city/city.service';
import { RegionService } from 'src/services/region/region.service';
import { Region } from 'src/entities/region';
import { District } from 'src/entities/district';
import { City } from 'src/entities/city';
import { SchoolAccountService } from 'src/services/school-account/school-account.service';
import { MailerService } from '@nestjs-modules/mailer';
import { google } from 'googleapis';
import { Subject } from 'src/entities/subject';
import { Role } from '../role.enum';
import { PaginatedItems } from '../controllers/teacher.controller';
import { Class } from 'src/entities/class';
import { WeekDays } from 'src/entities/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(SchoolAccount)
    private readonly schoolRepo: Repository<SchoolAccount>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subject)
    private readonly subjectRep: Repository<Subject>,
    @InjectRepository(Class)
    private readonly classRep: Repository<Class>,
    private authService: AuthService,
    private readonly districtService: DistrictService,
    private readonly cityService: CityService,
    private readonly regionService: RegionService,
    private readonly schoolAccountService: SchoolAccountService,
    private readonly mailerService: MailerService,
  ) {
    this.setUpNodeMailer();
  }

  async setUpNodeMailer() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      '397342060369-e1r98aem576dhvgv3chfpdk1i9spe5en.apps.googleusercontent.com',
      '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',
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token:
        '1//04vtBeFwlgZqMCgYIARAAGAQSNwF-L9IrgSqtrEFt5GNKGpREnY_iOsbAIURFRSJS-Gy6YGNQp96X60xA22tIERok_pkdOPymSiY',
      access_token:
        'ya29.a0AWY7CkmGriqBn1cbd68vllPygiWCo2AOyWtY92QHhALYe9w7HwLJ-gMhJLC4qFRI_xs3wZBc0NWIlqAD8mSR3_0CxgxMWoPp22NI_2fGYpPOr1fjxvVFT_8DTdt5Afovf08C8wt-LMGBxM8rmFScLDJYV_uIaCgYKAS8SARASFQG1tDrpQwLi6etsAySuJR7uOg5yGQ0163',
    });
    const accessToken = await oauth2Client.getAccessToken();
    this.mailerService.addTransporter('gmail', {
      service: 'gmail',
      auth: {
        type: 'oauth2',
        user: 'oleksandr.soluian@gmail.com',
        clientId:
          '397342060369-e1r98aem576dhvgv3chfpdk1i9spe5en.apps.googleusercontent.com',
        clientSecret: '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',
        accessToken: accessToken.token,
      },
    });
  }

  createOrganizer(schoolAccount: SchoolAccountDto): Observable<User> {
    const { regionName, districtName, districtType, cityName, cityType } =
      this.parseLocation(schoolAccount.school.koatuuName);
    return this.regionService.getOrCreate(regionName).pipe(
      switchMap((region: Region) =>
        this.districtService.getOrCreate({
          name: districtName,
          type: districtType,
          region: region,
        }),
      ),
      switchMap((district: District) =>
        this.cityService.getOrCreate({
          name: cityName,
          type: cityType,
          district: district,
        }),
      ),
      switchMap((city: City) =>
        this.schoolAccountService.create(city, schoolAccount.school),
      ),
      switchMap((schoolAcc: SchoolAccount) =>
        this.authService
          .hashPassword(schoolAccount.organizer.password, 12)
          .pipe(
            switchMap((hashedPassword: string) => {
              let userDto = Object.assign(schoolAccount.organizer, {
                password: hashedPassword,
                school: schoolAcc,
              });
              delete userDto.passwordRepeat;
              return this.userRepo.save(userDto);
            }),
          ),
      ),
    );
  }

  createTeacher(userDto: userDto, schoolId: number, subjects: number[]) {
    return forkJoin([
      this.authService.hashPassword(userDto.password, 12),
      from(
        this.schoolRepo.findOne({
          where: {
            id: schoolId,
          },
        }),
      ),
      from(
        this.subjectRep.findBy({
          id: In(subjects),
        }),
      ),
    ]).pipe(
      switchMap(([hashedPassword, school, subjects]) => {
        return from(
          this.userRepo.save({
            ...userDto,
            password: hashedPassword,
            school,
            subjects,
          }),
        ).pipe(
          tap((teacher: User) => {
            this.mailerService.sendMail({
              transporterName: 'gmail',
              to: teacher.email,
              from: 'noreply@nestjs.com',
              subject: 'Test',
              template: 'Test',
              context: {
                password: userDto.password,
              },
            });
          }),
        );
      }),
    );
  }

  async getAllTeachers(
    schoolId: number,
    pageIndex: number,
    pageSize: number,
    subjects: number[],
    weekDay?: WeekDays,
    slot?: number,
    preselectedTeacher?: number,
  ): Promise<PaginatedItems<User>> {
    let findClause: FindManyOptions<User> = {};
    findClause.relations = ['subjects', 'scheduleItems'];

    if (pageIndex + 1 && pageSize) {
      findClause.skip = pageIndex * pageSize;
      findClause.take = pageSize;
    } else {
      findClause.skip = 0;
      findClause.take = 20;
    }

    let whereClause: FindOptionsWhere<User> = {};
    whereClause.school = { id: schoolId };
    whereClause.role = Role.Teacher;

    if (subjects) {
      whereClause.subjects = {
        id: In(subjects),
      };
    }

    if (weekDay && slot + 1) {
      const ids = await this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.scheduleItems', 'scheduleItem')
        .where('scheduleItem.slot = :slot', { slot })
        .andWhere('scheduleItem.weekDay = :weekDay', { weekDay })
        .select('user.id')
        .execute();

      whereClause = {
        ...whereClause,
        id: Not(
          In(ids.map((i) => i.user_id).filter((i) => i !== preselectedTeacher)),
        ),
      };
    }

    findClause.where = whereClause;
    return firstValueFrom(
      from(this.userRepo.findAndCount(findClause)).pipe(
        map(([items, count]) => ({
          totalCount: count,
          pageIndex: pageIndex || 0,
          pageSize: pageSize || 20,
          items: items,
        })),
      ),
    );
  }

  createPupil(userDto: userDto, schoolId: number, classId: number) {
    return this.authService.hashPassword(userDto.password, 12).pipe(
      switchMap((hashPassword) => {
        return forkJoin([
          from(
            this.classRep.findOne({
              where: {
                id: classId,
              },
            }),
          ),
          from(
            this.schoolRepo.findOne({
              where: {
                id: schoolId,
              },
            }),
          ),
          of(hashPassword),
        ]);
      }),
      switchMap((data: [Class, SchoolAccount, string]) => {
        let [class_, school, password] = data;
        return this.userRepo.save({
          ...userDto,
          password: password,
          class: class_,
          school: school,
        });
      }),
    );
  }

  getAllPupils(
    schoolId: number,
    pageIndex: number,
    pageSize: number,
  ): Observable<PaginatedItems<User>> {
    return from(
      this.userRepo.findAndCount({
        where: {
          school: {
            id: schoolId,
          },
          role: Role.Pupil,
        },
        relations: ['class'],
        skip: pageIndex * pageSize || 0,
        take: pageSize || 20,
      }),
    ).pipe(
      map(([items, count]) => ({
        totalCount: count,
        pageIndex: pageIndex || 0,
        pageSize: pageSize || 0,
        items: items,
      })),
    );
  }

  isUserExistsByEmail(email: string): Observable<boolean> {
    if (email) {
      return from(
        this.userRepo.exist({
          where: { email: email.toLocaleLowerCase() },
        }),
      );
    } else {
      return of(false);
    }
  }
  getUserByEmail(email: string, safe: boolean): Observable<User> {
    return from(
      this.userRepo.findOne({
        where: { email: email.toLocaleLowerCase() },
        relations: [
          'school',
          'class',
          'school.city',
          'school.city',
          'school.city.district',
          'school.city.district.region',
        ],
      }),
    ).pipe(
      map((user: User) => {
        if (!user) throw new NotFoundException();
        if (!safe) return user;
        delete user.password;
        return user;
      }),
    );
  }

  login(user: User): Observable<string> {
    return this.validateCredentials(user.email, user.password).pipe(
      switchMap((user: User) => {
        return this.authService.generateJWT(user);
      }),
    );
  }

  validateCredentials(email: string, password: string): Observable<User> {
    return this.getUserByEmail(email.toLocaleLowerCase(), false).pipe(
      switchMap((user: User) =>
        this.authService.comparePasswords(password, user.password).pipe(
          map((match: boolean) => {
            if (!match) throw new UnauthorizedException();
            delete user.password; // maybe also should remove database ID?
            return user;
          }),
        ),
      ),
    );
  }

  getUserById(id: number): Observable<User> {
    return from(
      this.userRepo.findOne({
        where: { id },
        relations: ['school', 'class'],
      }),
    );
  }

  private parseLocation(location: string) {
    const tokens = location.split(', ');
    let districtType: string, cityType: string;
    cityType = tokens[0].startsWith('с. ')
      ? 'с'
      : tokens[0].startsWith('смт ')
      ? 'смт'
      : 'м';

    if (tokens.length === 1) {
      districtType = 'районний центр';
      return {
        regionName: tokens[0],
        districtName: tokens[0],
        cityName: tokens[0],
        districtType,
        cityType,
      };
    } else if (tokens.length === 2) {
      districtType = 'районний центр';
      return {
        regionName: tokens[1],
        districtName: tokens[0],
        cityName: tokens[0],
        districtType,
        cityType,
      };
    } else {
      districtType = 'район';
      return {
        regionName: tokens[2],
        districtName: tokens[1],
        cityName: tokens[0],
        districtType,
        cityType,
      };
    }
  }
}
