/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from '../services/user.service';
import { userDto } from 'src/controllers/school-account/school-account.controller';
@Controller('teachers')
@UseGuards(AuthGuard)
export class TeacherController {
  constructor(private userService: UserService) {}

  @Post('create')
  createTeacher(@Request() req, @Body() dto: userDto & { subjects: number[] }) {
    let { school, role } = req.user.user;
    let { subjects, ...userDto } = dto;
    if (role !== 0) {
      throw new ForbiddenException();
    }
    return this.userService.createTeacher(userDto, school.id, subjects);
  }

  @Get('')
  getTeachers(@Request() req, @Query() query) {
    let { school, role } = req.user.user;
    let { pageIndex, pageSize, subjectId, weekDay, slot, preselectedTeacher } =
      query;

    if (role !== 0) {
      throw new ForbiddenException();
    }
    if (!Array.isArray(subjectId) && parseInt(subjectId)) {
      subjectId = [parseInt(subjectId)];
    } else if (Array.isArray(subjectId)) {
      subjectId = subjectId.map((id) => parseInt(id));
    }

    return this.userService.getAllTeachers(
      school.id,
      parseInt(pageIndex),
      parseInt(pageSize),
      subjectId,
      weekDay,
      parseInt(slot),
      parseInt(preselectedTeacher),
    );
  }
}

export interface PaginatedItems<T> {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  items: T[];
}
