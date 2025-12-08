import { PartialType } from '@nestjs/mapped-types';
import { CreateComparisonImageDto } from './create-comparison-image.dto';

export class UpdateComparisonImageDto extends PartialType(CreateComparisonImageDto) {}
