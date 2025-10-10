import { PartialType } from "@nestjs/swagger";
import { ImageCreateDto } from "./Image.create.dto";

export class ImageUpdateDto extends PartialType(ImageCreateDto) {}