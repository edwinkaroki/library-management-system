import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  listSpaces() {
    return this.prisma.space.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  async create(userId: string, dto: CreateBookingDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || startAt >= endAt) {
      throw new BadRequestException('The booking end time must be after its start time.');
    }
    if (startAt <= new Date()) throw new BadRequestException('Bookings must start in the future.');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const space = await tx.space.findFirst({ where: { id: dto.spaceId, isActive: true } });
        if (!space) throw new NotFoundException('That library space is not available.');

        const conflict = await tx.booking.findFirst({
          where: {
            spaceId: dto.spaceId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
          select: { id: true },
        });
        if (conflict) throw new ConflictException('That space already has a booking during the selected time.');

        return tx.booking.create({
          data: { userId, spaceId: dto.spaceId, startAt, endAt },
          include: { space: true },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException('That space was booked at the same time. Please choose another slot.');
      }
      throw error;
    }
  }

  listAll() {
    return this.prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        space: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }
}
