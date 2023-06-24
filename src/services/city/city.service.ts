import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, of, switchMap } from 'rxjs';
import { City } from 'src/entities/city';
import { District } from 'src/entities/district';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  getOrCreate(city: CityDto): Observable<City> {
    return from(this.cityRepo.findOneBy({ name: city.name })).pipe(
      switchMap((found: City | undefined) => {
        if (found) return of(found);
        else return from(this.cityRepo.save(city));
      }),
    );
  }
}

export interface CityDto {
  name: string;
  type: string;
  district: District;
}
