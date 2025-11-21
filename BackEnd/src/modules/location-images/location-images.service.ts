import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { LocationImage, LocationImageStatus } from '../entities/location-image.entity';
import { MapLocations } from '../entities/map-location.entity';
import { CreateLocationImageDto } from './dto/create-location-image.dto';

@Injectable()
export class LocationImagesService {
  constructor(
    @InjectRepository(LocationImage)
    private readonly locationImageRepo: Repository<LocationImage>,
    @InjectRepository(MapLocations)
    private readonly locationsRepo: Repository<MapLocations>,
  ) {}

  async create(dto: CreateLocationImageDto, imagePath: string) {
    if (!dto.locationId) {
      throw new BadRequestException('locationId is required');
    }
    if (!imagePath) {
      throw new BadRequestException('Image file is required');
    }

    const location = await this.locationsRepo.findOne({
      where: { LocationID: dto.locationId },
    });
    if (!location) {
      throw new BadRequestException('Location not found');
    }

    const entity = this.locationImageRepo.create({
      LocationID: dto.locationId,
      UserID: dto.userId ?? null,
      Year: dto.year ?? null,
      ImagePath: imagePath,
      Status: 'pending',
    } as DeepPartial<LocationImage>);

    const saved = await this.locationImageRepo.save(entity);
    return {
      SubmissionID: saved.SubmissionID,
      LocationID: saved.LocationID,
      Year: saved.Year,
      Status: saved.Status,
      ImagePath: saved.ImagePath,
      CreatedAt: saved.CreatedAt,
      message: 'Ảnh đã được gửi, vui lòng chờ quản trị viên duyệt.',
    };
  }

  async findApprovedByLocation(locationId: number) {
    const items = await this.locationImageRepo.find({
      where: { LocationID: locationId, Status: 'approved' },
      order: { CreatedAt: 'DESC' },
      relations: ['user'],
    });

    return items.map((item) => ({
      SubmissionID: item.SubmissionID,
      LocationID: item.LocationID,
      Year: item.Year,
      ImagePath: item.ImagePath,
      Status: item.Status,
      CreatedAt: item.CreatedAt,
      submittedBy: item.user ? item.user.FullName : null,
    }));
  }

  async findPending() {
    return this.locationImageRepo.find({
      where: { Status: 'pending' },
      order: { CreatedAt: 'DESC' },
      relations: ['location', 'user'],
    });
  }

  async updateStatus(id: number, status: LocationImageStatus) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new BadRequestException('Status không hợp lệ');
    }

    const submission = await this.locationImageRepo.findOne({
      where: { SubmissionID: id },
    });
    if (!submission) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    submission.Status = status;
    await this.locationImageRepo.save(submission);

    return {
      SubmissionID: submission.SubmissionID,
      Status: submission.Status,
      updatedAt: submission.UpdatedAt,
    };
  }
}

