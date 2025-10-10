import { PartialType } from '@nestjs/mapped-types';
import { VersionHistoryCreateDto } from './VersionHistory.create';

export class VersionHistoryUpdateDto extends PartialType(VersionHistoryCreateDto) {}
