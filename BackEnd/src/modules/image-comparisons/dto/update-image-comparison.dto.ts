import { PartialType } from '@nestjs/mapped-types';
import { CreateImageComparisonDto } from './create-image-comparison.dto';

export class UpdateImageComparisonDto extends PartialType(CreateImageComparisonDto) {}
