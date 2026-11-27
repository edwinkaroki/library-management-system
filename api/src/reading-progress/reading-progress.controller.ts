import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SaveReadingProgressDto } from './dto/save-reading-progress.dto.js';
import { ReadingProgressService } from './reading-progress.service.js';

type AuthenticatedRequest = Request & { user: { id: string } };

@Controller('reading-progress')
@UseGuards(JwtAuthGuard)
export class ReadingProgressController {
  constructor(private readonly readingProgress: ReadingProgressService) {}

  @Get('latest')
  async latest(@Req() request: AuthenticatedRequest) {
    return { progress: await this.readingProgress.latestForUser(request.user.id) };
  }

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.readingProgress.listForUser(request.user.id);
  }

  @Get(':bookSlug')
  async findForBook(
    @Req() request: AuthenticatedRequest,
    @Param('bookSlug') bookSlug: string,
  ) {
    return { progress: await this.readingProgress.findForBook(request.user.id, bookSlug) };
  }

  @Put(':bookSlug')
  save(
    @Req() request: AuthenticatedRequest,
    @Param('bookSlug') bookSlug: string,
    @Body() dto: SaveReadingProgressDto,
  ) {
    return this.readingProgress.save(request.user.id, bookSlug, dto);
  }
}
