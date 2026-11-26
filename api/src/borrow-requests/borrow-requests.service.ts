import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BorrowStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto.js';
import { UpdateBorrowRequestDto } from './dto/update-borrow-request.dto.js';
import { calculateFine } from './fine-calculator.js';

const FINE_RATE_PER_DAY = Number(process.env.FINE_RATE_PER_DAY || 25);
const LOAN_PERIOD_DAYS = 14;

@Injectable()
export class BorrowRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBorrowRequestDto) {
    const bookIds = [...new Set(dto.bookIds)];
    if (bookIds.length !== dto.bookIds.length) {
      throw new BadRequestException('The reading list contains duplicate books.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const books = await tx.book.findMany({ where: { id: { in: bookIds } } });
        if (books.length !== bookIds.length) {
          throw new NotFoundException('One or more selected books could not be found.');
        }
        const unavailable = books.filter((book) => book.availableCopies < 1);
        if (unavailable.length) {
          throw new ConflictException(`No copies are currently available for: ${unavailable.map((book) => book.title).join(', ')}`);
        }

        const existing = await tx.borrowRequest.findFirst({
          where: {
            userId,
            status: { in: [BorrowStatus.PENDING, BorrowStatus.APPROVED, BorrowStatus.BORROWED] },
            books: { some: { id: { in: bookIds } } },
          },
          select: { id: true },
        });
        if (existing) throw new ConflictException('A selected book is already in one of your active borrow requests.');

        for (const bookId of bookIds) {
          const reservation = await tx.book.updateMany({
            where: { id: bookId, availableCopies: { gt: 0 } },
            data: { availableCopies: { decrement: 1 } },
          });
          if (reservation.count !== 1) throw new ConflictException('A selected book is no longer available. Please refresh your reading list.');
        }

        return tx.borrowRequest.create({
          data: { userId, books: { connect: bookIds.map((id) => ({ id })) } },
          include: { books: { include: { genre: true } } },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException('The catalog changed while processing your request. Please try again.');
      }
      throw error;
    }
  }

  listAll() {
    return this.prisma.borrowRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        books: { include: { genre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listMine(userId: string) {
    return this.prisma.borrowRequest.findMany({
      where: { userId },
      include: { books: { include: { genre: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateBorrowRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.borrowRequest.findUnique({
        where: { id },
        include: { books: true },
      });
      if (!request) throw new NotFoundException(`Borrow request "${id}" was not found.`);
      if (request.status === dto.status) return request;

      const transitions: Record<BorrowStatus, BorrowStatus[]> = {
        PENDING: [BorrowStatus.APPROVED, BorrowStatus.REJECTED],
        APPROVED: [BorrowStatus.BORROWED, BorrowStatus.REJECTED],
        REJECTED: [],
        BORROWED: [BorrowStatus.RETURNED],
        RETURNED: [],
      };
      if (!transitions[request.status].includes(dto.status)) {
        throw new BadRequestException(`Cannot change a request from ${request.status} to ${dto.status}.`);
      }

      if (dto.status === BorrowStatus.REJECTED || dto.status === BorrowStatus.RETURNED) {
        for (const book of request.books) {
          await tx.book.update({ where: { id: book.id }, data: { availableCopies: { increment: 1 } } });
        }
      }

      const now = new Date();
      const data: Prisma.BorrowRequestUpdateInput = { status: dto.status };
      if (dto.status === BorrowStatus.BORROWED) {
        data.dueDate = new Date(now.getTime() + LOAN_PERIOD_DAYS * 86_400_000);
      }
      if (dto.status === BorrowStatus.RETURNED) {
        if (!request.dueDate) throw new BadRequestException('This request has no due date to calculate a fine.');
        data.returnDate = now;
        data.fineAmount = calculateFine(request.dueDate, now, FINE_RATE_PER_DAY);
      }

      return tx.borrowRequest.update({
        where: { id },
        data,
        include: {
          user: { select: { id: true, name: true, email: true } },
          books: { include: { genre: true } },
        },
      });
    });
  }
}
