import { IsDateString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('all')
  spaceId: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;
}
