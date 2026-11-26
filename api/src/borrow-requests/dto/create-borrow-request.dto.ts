import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  bookIds: string[];
}
