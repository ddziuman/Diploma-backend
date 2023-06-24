import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SchoolAccount } from 'src/entities/school-account';
import { Repository } from 'typeorm';
import { Observable, from, of } from 'rxjs';
import { SchoolDto } from 'src/controllers/school-account/school-account.controller';
import { City } from 'src/entities/city';

@Injectable()
export class SchoolAccountService {
  constructor(
    @InjectRepository(SchoolAccount)
    private readonly schoolAccountRepo: Repository<SchoolAccount>,
  ) {}

  create(city: City, school: SchoolDto): Observable<SchoolAccount> {
    const {
      ownership,
      director,
      fullName,
      shortName,
      type,
      edebo,
      address,
      schoolPhoneNumber,
      workStatus,
    } = school;
    return from(
      this.schoolAccountRepo.save({
        city: city,
        ownership: ownership,
        director: director,
        fullName: fullName,
        shortName: shortName,
        type: type,
        edebo: edebo,
        address: address,
        workStatus: workStatus,
        schoolPnoneNumber: schoolPhoneNumber,
      }),
    );
  }

  isAccountWithEdeboExists(edebo: number): Observable<boolean> {
    if (edebo) {
      return from(
        this.schoolAccountRepo.exist({
          where: {
            edebo: edebo,
          },
        }),
      );
    } else {
      return of(false);
    }
  }
}
