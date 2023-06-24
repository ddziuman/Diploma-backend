import { Controller, Get } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Subject } from 'src/entities/subject';
import { SubjectService } from 'src/services/subject.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectService: SubjectService) {}
  @Get()
  getSubject(): Observable<Subject[]> {
    return this.subjectService.getAllSubjects();
  }
}
