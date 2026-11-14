import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PageDto } from '../common/dto.js';
import { pricePattern, quantityPattern } from '../products/products.dto.js';

export type RequirementStatus = 'OPEN' | 'FULFILLED' | 'CLOSED';
export const RequirementStatus = {
  OPEN: 'OPEN',
  FULFILLED: 'FULFILLED',
  CLOSED: 'CLOSED',
} as const;

export type UrgencyLevel = 'NORMAL' | 'HIGH' | 'URGENT';
export const UrgencyLevel = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export class CreateBuyerRequirementDto {
  @ApiProperty({ example: 'Fresh Red Onions' })
  @IsString()
  @Length(2, 150)
  @Matches(/\S/)
  productName!: string;

  @ApiProperty({ example: 'Vegetables' })
  @IsString()
  @Length(2, 80)
  @Matches(/\S/)
  category!: string;

  @ApiProperty({ example: '1500', type: String })
  @Transform(({ value }) =>
    value !== undefined && value !== null ? String(value) : value,
  )
  @IsString()
  @Matches(quantityPattern)
  quantity!: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @Length(1, 20)
  @Matches(/\S/)
  unit!: string;

  @ApiPropertyOptional({ example: '28.00', type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? String(value)
      : undefined,
  )
  @IsString()
  @Matches(pricePattern)
  targetPrice?: string;

  @ApiPropertyOptional({ example: 'Within 3 days' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  neededBy?: string;

  @ApiPropertyOptional({
    enum: ['NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  })
  @IsOptional()
  @IsIn(['NORMAL', 'HIGH', 'URGENT'])
  urgency?: UrgencyLevel;

  @ApiProperty({ example: 'Ernakulam, Kerala' })
  @IsString()
  @Length(2, 200)
  @Matches(/\S/)
  location!: string;

  @ApiPropertyOptional({
    example: 'Green Harvest Central Warehouse, Kalamassery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryAddress?: string;

  @ApiProperty({
    example: 'Seeking medium-to-large sorted Nashik red onions.',
  })
  @IsString()
  @Length(1, 2000)
  @Matches(/\S/)
  description!: string;
}

export class UpdateBuyerRequirementDto {
  @ApiPropertyOptional({ enum: ['OPEN', 'FULFILLED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'FULFILLED', 'CLOSED'])
  status?: RequirementStatus;

  @ApiPropertyOptional({ example: 'Fresh Red Onions' })
  @IsOptional()
  @IsString()
  @Length(2, 150)
  @Matches(/\S/)
  productName?: string;

  @ApiPropertyOptional({ example: 'Vegetables' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Matches(/\S/)
  category?: string;

  @ApiPropertyOptional({ example: '1500', type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? String(value) : value,
  )
  @IsString()
  @Matches(quantityPattern)
  quantity?: string;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Matches(/\S/)
  unit?: string;

  @ApiPropertyOptional({ example: '28.00', type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? String(value)
      : undefined,
  )
  @IsString()
  @Matches(pricePattern)
  targetPrice?: string;

  @ApiPropertyOptional({ example: 'Within 3 days' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  neededBy?: string;

  @ApiPropertyOptional({ enum: ['NORMAL', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['NORMAL', 'HIGH', 'URGENT'])
  urgency?: UrgencyLevel;

  @ApiPropertyOptional({ example: 'Ernakulam, Kerala' })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  @Matches(/\S/)
  location?: string;

  @ApiPropertyOptional({
    example: 'Green Harvest Central Warehouse, Kalamassery',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryAddress?: string;

  @ApiPropertyOptional({
    example: 'Seeking medium-to-large sorted Nashik red onions.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  @Matches(/\S/)
  description?: string;
}

export class BuyerRequirementQueryDto extends PageDto {
  @ApiPropertyOptional({
    description: 'Search produce name, description, location, or buyer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ enum: ['NORMAL', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['NORMAL', 'HIGH', 'URGENT'])
  urgency?: UrgencyLevel;

  @ApiPropertyOptional({ enum: ['OPEN', 'FULFILLED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'FULFILLED', 'CLOSED'])
  status?: RequirementStatus;
}
