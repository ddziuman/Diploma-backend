import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { of, from, forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Class } from 'src/entities/class';
import { ScheduleItem, WeekDays } from 'src/entities/schedule';
import { SchoolAccount } from 'src/entities/school-account';
import { Subject } from 'src/entities/subject';
import {
  SaveScheduleDto,
  ScheduleDto,
} from 'src/user/controllers/schedule.controller';
import { User } from 'src/user/user';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(SchoolAccount)
    private readonly schoolRepo: Repository<SchoolAccount>,
    @InjectRepository(ScheduleItem)
    private readonly scheduleRepo: Repository<ScheduleItem>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  getClassSchedule(schoolId: number, classId: number): Observable<ScheduleDto> {
    return from(
      this.scheduleRepo.find({
        where: {
          school: {
            id: schoolId,
          },
          class: {
            id: classId,
          },
        },
        relations: ['teacher', 'teacher.subjects', 'subject'],
      }),
    ).pipe(
      map((items) => {
        let result = {} as ScheduleDto;
        for (let weekDay in WeekDays) {
          result[WeekDays[weekDay]] = items
            .filter((i) => i.weekDay === WeekDays[weekDay])
            .map((i) => {
              let isSubjectValid = i.teacher.subjects.some(
                (subject) => subject.id === i.subject.id,
              );
              if (!isSubjectValid) {
                throw new BadRequestException();
              }
              return {
                slot: i.slot,
                description: i.description,
                subjectId: i.subject.id,
                teacherId: i.teacher.id,
              };
            })
            .sort((a, b) => {
              if (a.slot < b.slot) return -1;
              if (a.slot > b.slot) return 1;
              return 0;
            });
        }
        return result;
      }),
    );
  }
  saveSchedule(schoolId: number, scheduleDto: SaveScheduleDto) {
    return forkJoin([
      from(
        this.schoolRepo.findOne({
          where: {
            id: schoolId,
          },
        }),
      ),
      from(
        this.classRepo.findOne({
          where: {
            id: scheduleDto.classId,
          },
        }),
      ),
    ]).pipe(
      switchMap(async ([school, _class]) => {
        let toSave = [];
        for (let weekDay in scheduleDto.schedule) {
          for (let row of scheduleDto.schedule[weekDay]) {
            let subject = await this.subjectRepo.findOne({
              where: { id: row.subjectId },
              relations: ['users'],
            });
            let teacher = await this.userRepo.findOne({
              where: { id: row.teacherId },
              relations: ['subjects'],
            });

            let isSubjectValid = teacher.subjects.some(
              (currentSubject) => currentSubject.id === subject.id,
            );
            if (!isSubjectValid) {
              throw new BadRequestException();
            }
            toSave.push({
              school: school,
              class: _class,
              weekDay: weekDay,
              description: row.description || '',
              slot: row.slot,
              subject,
              teacher,
            });
          }
        }
        let classSchedule = await this.scheduleRepo.find({
          where: {
            school: {
              id: schoolId,
            },
            class: {
              id: scheduleDto.classId,
            },
          },
          relations: ['school', 'class'],
        });
        console.log(classSchedule.length);
        for (let i = 0; i < classSchedule.length; i++) {
          let founded = toSave.find((item) => {
            if (
              item.school.id === classSchedule[i].school.id &&
              item.class.id === classSchedule[i].class.id &&
              item.weekDay === classSchedule[i].weekDay &&
              item.slot === classSchedule[i].slot
            ) {
              return true;
            }
            return false;
          });

          if (!founded) {
            await this.scheduleRepo.delete({
              id: classSchedule[i].id,
            });
          }
        }
        return this.scheduleRepo.upsert(toSave, [
          'slot',
          'school',
          'class',
          'weekDay',
        ]);
      }),
    );
  }
}
