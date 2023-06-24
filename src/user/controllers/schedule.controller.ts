import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { WeekDays } from 'src/entities/schedule';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { ScheduleService } from 'src/services/schedule/schedule.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('schedule')
@UseGuards(AuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get(':classId')
  getSchedule(@Request() req, @Param() params) {
    let { school, role } = req.user.user;
    let { classId } = params;
    if (role !== 0) {
      throw new ForbiddenException();
    }
    return this.scheduleService.getClassSchedule(school.id, classId);
  }

  @Post('save')
  saveSchedule(@Request() req, @Body() scheduleDto: SaveScheduleDto) {
    let { school, role } = req.user.user;
    if (role !== 0) {
      throw new ForbiddenException();
    }
    return this.scheduleService.saveSchedule(school.id, scheduleDto);
  }
}

export interface SaveScheduleDto {
  classId: number;
  schedule: ScheduleDto;
}
export type ScheduleDto = {
  [key in WeekDays]: {
    slot: number;
    subjectId: number;
    teacherId: number;
    description: string;
  }[];
};
