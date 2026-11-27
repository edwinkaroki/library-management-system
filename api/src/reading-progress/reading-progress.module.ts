import { Module } from '@nestjs/common';
import { ReadingProgressController } from './reading-progress.controller.js';
import { ReadingProgressService } from './reading-progress.service.js';

@Module({ controllers: [ReadingProgressController], providers: [ReadingProgressService] })
export class ReadingProgressModule {}
