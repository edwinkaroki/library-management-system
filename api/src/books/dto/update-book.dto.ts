import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  isbn?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalCopies?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  genreId?: string;

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

