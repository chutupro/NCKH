import { PartialType } from "@nestjs/swagger";
import { CreateArticleDto } from "./articles.create.dto";

export class UpdateArticleDto extends PartialType(CreateArticleDto)  {}