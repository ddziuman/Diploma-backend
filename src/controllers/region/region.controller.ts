import { Body, Controller, Post } from '@nestjs/common';
import { RegionService } from 'src/services/region/region.service';

@Controller('regions')
export class RegionController {
  constructor(private regionService: RegionService) {}
}
