import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenresService } from './genres.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('GenresService', () => {
  let service: GenresService;
  let prisma: {
    genre: {
      create: any;
      findMany: any;
      findUnique: any;
      update: any;
      delete: any;
    };
  };

  beforeEach(async () => {
    prisma = {
      genre: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all genres ordered by name asc', async () => {
      const mockGenres = [
        { id: '1', name: 'Fantasy' },
        { id: '2', name: 'Science Fiction' },
      ];
      prisma.genre.findMany.mockResolvedValue(mockGenres);

      const result = await service.findAll();
      expect(prisma.genre.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockGenres);
    });
  });

  describe('findOne', () => {
    it('should return a genre by ID', async () => {
      const mockGenre = { id: '1', name: 'Fantasy', books: [] };
      prisma.genre.findUnique.mockResolvedValue(mockGenre);

      const result = await service.findOne('1');
      expect(result).toEqual(mockGenre);
    });
  });

  describe('create', () => {
    it('should create a new genre', async () => {
      prisma.genre.findUnique.mockResolvedValue(null);
      const newGenre = { id: '3', name: 'Mystery', description: 'Thrilling' };
      prisma.genre.create.mockResolvedValue(newGenre);

      const result = await service.create({ name: 'Mystery', description: 'Thrilling' });
      expect(result).toEqual(newGenre);
    });
  });

  describe('update', () => {
    it('should update an existing genre', async () => {
      prisma.genre.findUnique.mockResolvedValueOnce({ id: '1', name: 'Fantasy' });
      prisma.genre.findUnique.mockResolvedValueOnce(null);
      const updatedGenre = { id: '1', name: 'Epic Fantasy' };
      prisma.genre.update.mockResolvedValue(updatedGenre);

      const result = await service.update('1', { name: 'Epic Fantasy' });
      expect(result).toEqual(updatedGenre);
    });
  });

  describe('remove', () => {
    it('should delete a genre', async () => {
      prisma.genre.findUnique.mockResolvedValue({ id: '1', name: 'Fantasy' });
      prisma.genre.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result).toEqual({ id: '1' });
    });
  });
});

