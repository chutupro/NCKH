import { IsInt, Min, Max, IsString, Length, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  ArticleID: number;

  @IsInt()
  UserID: number;

  @IsString()
  @Length(0, 500)
  @IsOptional()
  Comment?: string;

  @IsInt()
  @Min(0)
  @Max(5)
  Rating: number;
}