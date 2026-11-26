import { Module } from '@nestjs/common';
import { BorrowRequestsController } from './borrow-requests.controller.js';
import { BorrowRequestsService } from './borrow-requests.service.js';

@Module({ controllers: [BorrowRequestsController], providers: [BorrowRequestsService] })
export class BorrowRequestsModule {}
