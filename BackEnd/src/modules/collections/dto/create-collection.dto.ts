import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Title?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsString()
  ImagePath?: string;

  @IsOptional()
  @IsString()
  ImageDescription?: string;

  @IsOptional()
  @IsNumber()
  CategoryID?: number;

  @IsOptional()
  @IsArray()
  ArticleIDs?: number[];
}
