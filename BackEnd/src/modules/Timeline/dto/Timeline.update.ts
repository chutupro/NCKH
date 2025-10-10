import { PartialType } from '@nestjs/mapped-types';
import { TimelineCreateDto } from './Timeline.create';

export class TimelineUpdateDto extends PartialType(TimelineCreateDto) {}
