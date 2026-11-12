import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!genre) {
      throw new NotFoundException(
        `Genre with ID "${createBookDto.genreId}" not found`,
      );
    }

    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(
        `Book with ISBN "${createBookDto.isbn}" already exists`,
      );
    }

    const availableCopies =
      createBookDto.availableCopies !== undefined
        ? createBookDto.availableCopies
        : createBookDto.totalCopies;

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        totalCopies: createBookDto.totalCopies,
        availableCopies,
        genreId: createBookDto.genreId,
        publishedYear: createBookDto.publishedYear,
      },
      include: {
        genre: true,
      },
    });
  }

  async findAll(query?: {
    genreId?: string;
    search?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const { genreId, search, page, limit } = query || {};
    const where: Prisma.BookWhereInput = {};

    if (genreId) {
      where.genreId = genreId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = page ? Math.max(1, parseInt(String(page), 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(String(limit), 10)) : 10;
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: {
        genre: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(
          `Genre with ID "${updateBookDto.genreId}" not found`,
        );
      }
    }

    if (updateBookDto.isbn) {
      const existingIsbn = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });
      if (existingIsbn && existingIsbn.id !== id) {
        throw new ConflictException(
          `Book with ISBN "${updateBookDto.isbn}" already exists`,
        );
      }
    }

    const data: Prisma.BookUpdateInput = {};
    if (updateBookDto.title !== undefined) data.title = updateBookDto.title;
    if (updateBookDto.author !== undefined) data.author = updateBookDto.author;
    if (updateBookDto.isbn !== undefined) data.isbn = updateBookDto.isbn;
    if (updateBookDto.totalCopies !== undefined) data.totalCopies = updateBookDto.totalCopies;
    if (updateBookDto.availableCopies !== undefined) data.availableCopies = updateBookDto.availableCopies;
    if (updateBookDto.publishedYear !== undefined) data.publishedYear = updateBookDto.publishedYear;
    if (updateBookDto.genreId !== undefined) {
      data.genre = { connect: { id: updateBookDto.genreId } };
    }

    return this.prisma.book.update({
      where: { id },
      data,
      include: {
        genre: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
