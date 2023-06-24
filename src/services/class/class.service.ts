/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, EMPTY, throwError, switchMap, map } from 'rxjs';
import { ClassDto } from 'src/controllers/class/class.controller';
import { SchoolDto } from 'src/controllers/school-account/school-account.controller';
import { Class } from 'src/entities/class';
import { Repository } from 'typeorm';

const possibleGrades = [5, 6, 7, 8, 9, 10, 11];
@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  getAllClasses(schoolId: number): Observable<SchoolDto> {
    return from(
      this.classRepository.find({
        where: {
          school: {
            id: schoolId,
          },
        },
      }),
    ).pipe(
      map((classes) => {
        let result: SchoolDto = {} as SchoolDto;
        possibleGrades.forEach((grade) => {
          result[grade] = classes
            .filter((item) => item.grade === grade)
            .map((item) => ({
              sequence: item.sequence,
              name: item.name,
              id: item.id,
            }));
        });
        return result;
      }),
    );
  }

  defineClasses(classDto: ClassDto, schoolId: number): Observable<Class[]> {
    return this.isClassesDefined(schoolId).pipe(
      switchMap((exist) => {
        if (exist) {
          return throwError(() => new Error());
        }
        let itemsToCreate: Partial<Class>[] = [];
        for (let key in classDto) {
          itemsToCreate.push(
            ...classDto[key].map(
              (item) =>
                ({
                  ...item,
                  grade: parseInt(key),
                  school: {
                    id: schoolId,
                  },
                } as Class),
            ),
          );
        }
        return from(this.classRepository.save(itemsToCreate));
      }),
    );
  }
  isClassesDefined(schoolId: number): Observable<boolean> {
    return from(
      this.classRepository.exist({
        where: {
          school: {
            id: schoolId,
          },
        },
      }),
    );
  }
}
