import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Controller('contributions')
export class contributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const contribution = await this.contributionsService.findOne(id);
    if (!contribution) {
      throw new HttpException('Đóng góp không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return contribution;
  }

  @Post()
  create(@Body(new ValidationPipe()) contributionData: CreateContributionDto) {
    return this.contributionsService.create(contributionData);
  }

  @Patch(':id')
  update(
    @Body() contributionData: UpdateContributionDto,
    @Param('id') id: number,
  ) {
    return this.contributionsService.update(id, contributionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const contribution = await this.contributionsService.delete(id);
    if (!contribution) {
      throw new HttpException('Đóng góp không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return contribution;
  }
}

