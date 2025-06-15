import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../entities/media.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(file: Express.Multer.File, title: string, description: string, isPublic: boolean) {
    const uploadResult = await this.cloudinaryService.uploadImage(file);
    
    const media = this.mediaRepository.create({
      title,
      description,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      isPublic,
    });

    return this.mediaRepository.save(media);
  }

  async findAll() {
    return this.mediaRepository.find();
  }

  async findOne(id: string) {
    return this.mediaRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    const media = await this.findOne(id);
    if (media) {
      await this.cloudinaryService.deleteImage(media.publicId);
      return this.mediaRepository.remove(media);
    }
    return null;
  }
} 