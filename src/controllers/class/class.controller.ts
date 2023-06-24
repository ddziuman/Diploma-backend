import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Observable, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthGuard } from 'src/auth/auth.guard';
import { Class } from 'src/entities/class';
import { ClassService } from 'src/services/class/class.service';
import { BadRequestException } from '@nestjs/common/exceptions';

@Controller('classes')
@UseGuards(AuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('')
  classes(@Request() req) {
    let schoolId: number = req.user.user.school.id;
    return this.classService.getAllClasses(schoolId);
  }
  @Get('isDefined')
  isClassesDefined(@Request() req) {
    let schoolId: number = req.user.user.school.id;
    return this.classService
      .isClassesDefined(schoolId)
      .pipe(map((isDefined) => ({ isDefined: isDefined })));
  }
  @Post('')
  createClass(
    @Body() classDto: ClassDto,
    @Request() req,
  ): Observable<Class[] | BadRequestException> {
    let schoolId: number = req.user.user.school.id;
    return this.classService.defineClasses(classDto, schoolId).pipe(
      catchError((err) => {
        return of(
          new BadRequestException({ message: 'Classes are already defined' }),
        );
      }),
    );
  }
}

export interface ClassDto {
  [key: number]: ClassDescription[];
}
export interface ClassDescription {
  sequence: number;
  name: string;
}
