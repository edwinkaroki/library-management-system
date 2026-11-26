import { IsEnum } from 'class-validator';
import { BorrowStatus } from '@prisma/client';

export class UpdateBorrowRequestDto {
  @IsEnum(BorrowStatus)
  status: BorrowStatus;
}
