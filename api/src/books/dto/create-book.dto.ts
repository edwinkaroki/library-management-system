import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalCopies: number;

  @IsString()
  @IsNotEmpty()
  genreId: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  publishedYear?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  availableCopies?: number;
}

