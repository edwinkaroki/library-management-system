import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SaveReadingProgressDto {
  @IsInt()
  @Min(0)
  chapterIndex!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  chapterTitle?: string;

  @IsInt()
  @Min(0)
  lineIndex!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lineText?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent!: number;
}
