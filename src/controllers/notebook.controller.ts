/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Param, Put, Get } from '@nestjs/common';
import { PupilNotebook } from 'src/entities/pupil-notebook';
import { PupilNotebookService } from 'src/services/pupil-notebook.service';
import { InsertResult } from 'typeorm';

@Controller('notebooks')
export class NotebookController {
  constructor(private readonly notebookService: PupilNotebookService) {}

  @Get(':pupil/:page')
  async notebook(@Param() { pupil, page }: { pupil: string; page: string }) {
    return this.notebookService.getNotebookPageByUserId(pupil, page);
  }

  @Post()
  async create(@Body() notebook: PupilNotebook): Promise<PupilNotebook> {
    return this.notebookService.create(notebook);
  }

  @Post('/emptyPage')
  async createEmptyPage(): Promise<InsertResult> {
    return this.notebookService.createEmptyPage(1);
  }
}
