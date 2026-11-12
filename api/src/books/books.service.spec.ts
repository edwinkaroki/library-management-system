import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BooksService } from './books.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      findMany: any;
      findUnique: any;
      create: any;
      update: any;
      delete: any;
    };
    genre: {
      findUnique: any;
    };
  };

  beforeEach(async () => {
    prisma = {
      book: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      genre: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should build where clause from genreId and search, and apply skip/take for pagination', async () => {
      const mockBooks = [{ id: '1', title: 'Dune', author: 'Frank Herbert' }];
      prisma.book.findMany.mockResolvedValue(mockBooks);

      const result = await service.findAll({
        genreId: 'genre-123',
        search: 'dune',
        page: 2,
        limit: 5,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {
          genreId: 'genre-123',
          OR: [
            { title: { contains: 'dune', mode: 'insensitive' } },
            { author: { contains: 'dune', mode: 'insensitive' } },
          ],
        },
        skip: 5,
        take: 5,
        include: {
          genre: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockBooks);
    });

    it('should use default pagination (page=1, limit=10) when not provided', async () => {
      prisma.book.findMany.mockResolvedValue([]);

      await service.findAll({});

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          genre: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('create', () => {
    it('should create a book when genre exists and isbn is unique', async () => {
      prisma.genre.findUnique.mockResolvedValue({ id: 'genre-1', name: 'Sci-Fi' });
      prisma.book.findUnique.mockResolvedValue(null);
      const newBook = {
        id: 'book-1',
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '12345',
        totalCopies: 5,
        availableCopies: 5,
        genreId: 'genre-1',
      };
      prisma.book.create.mockResolvedValue(newBook);

      const result = await service.create({
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '12345',
        totalCopies: 5,
        genreId: 'genre-1',
      });

      expect(result).toEqual(newBook);
    });
  });
});

