import {
  Controller,
  UseGuards,
  Post,
  Request,
  ForbiddenException,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from '../services/user.service';
import { userDto } from 'src/controllers/school-account/school-account.controller';

@Controller('pupils')
@UseGuards(AuthGuard)
export class PupilController {
  constructor(private userService: UserService) {}

  @Post('create') createPupil(
    @Request() req,
    @Body() dto: userDto & { classId: number },
  ) {
    let { school, role } = req.user.user;
    let { classId, ...userDto } = dto;

    if (role !== 0) {
      throw new ForbiddenException();
    }

    return this.userService.createPupil(userDto, school.id, classId);
  }

  @Get('')
  getPupils(@Request() req, @Query() query) {
    let { school, role } = req.user.user;
    let { pageIndex, pageSize } = query;

    if (role !== 0) {
      throw new ForbiddenException();
    }

    return this.userService.getAllPupils(school.id, pageIndex, pageSize);
  }
}
