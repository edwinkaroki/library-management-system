import { Module } from '@nestjs/common';
import { DigitalLibraryController } from './digital-library.controller.js';

@Module({ controllers: [DigitalLibraryController] })
export class DigitalLibraryModule {}
