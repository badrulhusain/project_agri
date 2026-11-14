import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { quantityPattern } from '../products/products.dto.js';

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;
  @ApiProperty({ type: String, example: '300' })
  @IsString()
  @Matches(quantityPattern)
  quantity!: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
  @ApiProperty({ example: 'Demo market, Coimbatore' })
  @IsString()
  @Length(5, 1000)
  @Matches(/\S/)
  deliveryAddress!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['CONFIRMED', 'COMPLETED', 'REJECTED'] })
  @IsIn(['CONFIRMED', 'COMPLETED', 'REJECTED'])
  status!: 'CONFIRMED' | 'COMPLETED' | 'REJECTED';
}
