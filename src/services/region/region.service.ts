import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, of, switchMap } from 'rxjs';
import { Region } from 'src/entities/region';
import { Repository } from 'typeorm';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
  ) {}

  getOrCreate(regionName: string): Observable<Region> {
    return from(this.regionRepo.findOneBy({ name: regionName })).pipe(
      switchMap((found: Region | undefined) => {
        if (found) return of(found);
        else
          return from(
            this.regionRepo.save({
              name: regionName,
            }),
          );
      }),
    );
  }
}
