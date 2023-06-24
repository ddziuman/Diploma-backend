import { Body, Controller, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { District } from 'src/entities/district';
import { DistrictService } from 'src/services/district/district.service';

@Controller('districts')
export class DistrictController {
  constructor(private districtService: DistrictService) {}
}
