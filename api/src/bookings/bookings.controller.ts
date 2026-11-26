import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { BookingsService } from './bookings.service.js';

type AuthenticatedRequest = Request & { user: { id: string } };

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('spaces')
  listSpaces() {
    return this.bookingsService.listSpaces();
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(request.user.id, dto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.LIBRARIAN)
  listAll() {
    return this.bookingsService.listAll();
  }
}

