import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto.js';
import { UpdateBorrowRequestDto } from './dto/update-borrow-request.dto.js';
import { BorrowRequestsService } from './borrow-requests.service.js';

type AuthenticatedRequest = Request & { user: { id: string } };

@Controller('borrow-requests')
@UseGuards(JwtAuthGuard)
export class BorrowRequestsController {
  constructor(private readonly borrowRequestsService: BorrowRequestsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateBorrowRequestDto) {
    return this.borrowRequestsService.create(request.user.id, dto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  listAll() {
    return this.borrowRequestsService.listAll();
  }

  @Get('mine')
  listMine(@Req() request: AuthenticatedRequest) {
    return this.borrowRequestsService.listMine(request.user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBorrowRequestDto) {
    return this.borrowRequestsService.updateStatus(id, dto);
  }
}

