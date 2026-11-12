import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: any;
      create: any;
    };
  };
  let jwtService: {
    sign: any;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password with bcrypt before saving and return a JWT', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(async ({ data }: any) => ({
        id: 'user-1',
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash: data.passwordHash,
      }));

      const result = await service.register({
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).toBeDefined();
      expect(createCall.data.passwordHash).not.toEqual('Password123!');
      const isValid = await bcrypt.compare('Password123!', createCall.data.passwordHash);
      expect(isValid).toBe(true);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('newuser@example.com');
    });

    it('should throw ConflictException if email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should verify password with bcrypt and return a JWT token', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: hashedPassword,
        name: 'User',
        role: Role.PATRON,
      });

      const result = await service.login({
        email: 'user@example.com',
        password: 'CorrectPassword',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: hashedPassword,
        name: 'User',
        role: Role.PATRON,
      });

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

