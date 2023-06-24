import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, of, switchMap } from 'rxjs';
import { District } from 'src/entities/district';
import { Region } from 'src/entities/region';
import { Repository } from 'typeorm';

@Injectable()
export class DistrictService {
  constructor(
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
  ) {}

  getOrCreate(district: DistrictDto): Observable<District> {
    return from(this.districtRepo.findOneBy({ name: district.name })).pipe(
      switchMap((found: District | undefined) => {
        if (found) return of(found);
        else return from(this.districtRepo.save(district));
      }),
    );
  }
}

export interface DistrictDto {
  type: string;
  name: string;
  region: Region;
}
