/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotebookPage } from 'src/entities/notebook-page';
import { PupilNotebook } from 'src/entities/pupil-notebook';
import { Repository } from 'typeorm';
import * as Y from 'yjs';

@Injectable()
export class PupilNotebookService {
  constructor(
    @InjectRepository(PupilNotebook)
    private pupilNotebook: Repository<PupilNotebook>,
    @InjectRepository(NotebookPage)
    private notebookPage: Repository<NotebookPage>,
  ) {}

  async getNotebookPageByUserId(pupil: string, page: string) {
    return this.pupilNotebook
      .findOne({
        where: {
          pupil: parseInt(pupil),
        },
      })
      .then(({ id }) => {
        return this.notebookPage
          .find({
            where: {
              notebook: id,
              pageNumber: parseInt(page),
            },
            select: ['notebookPageByteArr', 'pageNumber'],
          })
          .then((item) => item.at(0));
      });
  }

  async updateNotebookPage(userId: number, byteArr: Buffer, pageId: number) {
    return this.pupilNotebook
      .findOne({
        where: {
          pupil: userId,
        },
      })
      .then(({ id }) => {
        return this.notebookPage.update(
          {
            id: pageId,
          },
          {
            notebookPageByteArr: byteArr,
          },
        );
      });
  }

  async create(pupilNotebook: PupilNotebook) {
    return this.pupilNotebook.save(pupilNotebook);
  }

  async createEmptyPage(notebookId: number) {
    const ydoc = new Y.Doc();

    let count = await this.notebookPage.count({
      where: {
        notebook: notebookId,
      },
    });
    let nextPage: number;
    if (count) {
      nextPage =
        (
          await this.notebookPage.findOne({
            order: {
              pageNumber: 'DESC',
            },
            where: {
              notebook: notebookId,
            },
          })
        ).pageNumber + 1;
    } else {
      nextPage = 1;
    }

    const encoded = Y.encodeStateAsUpdate(ydoc);
    return this.notebookPage.insert({
      notebook: notebookId,
      notebookPageByteArr: encoded,
      pageNumber: nextPage,
    });
  }
}
