import { IsInt, Min, Max, IsString, Length, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @IsInt()
  @IsOptional()
  ArticleID?: number;

  @IsInt()
  @IsOptional()
  UserID?: number;

  @IsString()
  @Length(0, 500)
  @IsOptional()
  Comment?: string;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  Rating?: number;
}