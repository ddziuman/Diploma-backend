import { Body, Controller, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { City } from 'src/entities/city';
import { CityService } from 'src/services/city/city.service';

@Controller('cities')
export class CityController {
  constructor(private cityService: CityService) {}

  @Post()
  getOrCreate(@Body() city: City): Observable<City> {
    return this.cityService.getOrCreate(city);
  }
}
