import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import type { Role, SchemeStatus, SurplusStatus, ProductStatus } from '@prisma/client';
import { PageDto } from '../common/dto.js';

export class AdminUserQueryDto extends PageDto {
  @ApiPropertyOptional({ enum: ['FARMER', 'BUYER', 'ADMIN'] })
  @IsOptional()
  @IsIn(['FARMER', 'BUYER', 'ADMIN'])
  role?: Role;

  @ApiPropertyOptional({ example: 'Ravi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive!: boolean;
}

export class CreateSchemeDto {
  @ApiProperty({ example: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)' })
  @IsString()
  @Length(2, 200)
  @Matches(/\S/)
  name!: string;

  @ApiProperty({
    example:
      'Income support of Rs. 6000 per year for all landholding farmer families.',
  })
  @IsString()
  @Length(5, 4000)
  @Matches(/\S/)
  description!: string;

  @ApiPropertyOptional({ example: 'Department of Agriculture & Farmers Welfare' })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  department?: string;

  @ApiProperty({
    example:
      'Direct transfer of Rs 6,000 per year in three equal 4-monthly installments.',
  })
  @IsString()
  @Length(2, 2000)
  @Matches(/\S/)
  benefits!: string;

  @ApiPropertyOptional({
    example: 'Cultivable landholding in the name of the farmer.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  eligibilityCriteria?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Aadhaar', 'Land Records', 'Bank Passbook'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  requiredDocuments?: string[];

  @ApiPropertyOptional({
    example: 'Apply online at pmkisan.gov.in or nearest CSC center.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  applicationProcess?: string;

  @ApiPropertyOptional({ example: 'https://pmkisan.gov.in' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  officialUrl?: string;

  @ApiPropertyOptional({ example: 'All India' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
    default: 'PUBLISHED',
  })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'CLOSED'])
  status?: SchemeStatus;
}

export class UpdateSchemeDto extends PartialType(CreateSchemeDto) {}

export class UpdateProductStatusDto {
  @ApiProperty({ enum: ['AVAILABLE', 'PARTIALLY_SOLD', 'SOLD_OUT', 'INACTIVE'] })
  @IsIn(['AVAILABLE', 'PARTIALLY_SOLD', 'SOLD_OUT', 'INACTIVE'])
  status!: ProductStatus;
}

export class UpdateSurplusStatusDto {
  @ApiProperty({ enum: ['OPEN', 'RESOLVED', 'CANCELLED'] })
  @IsIn(['OPEN', 'RESOLVED', 'CANCELLED'])
  status!: SurplusStatus;
}
