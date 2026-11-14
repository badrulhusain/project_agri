import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PageDto } from '../common/dto.js';

// Fixed precision strings avoid binary floating point input and database rounding.
export const quantityPattern =
  /^(?=.*[1-9])(?:0|[1-9]\d{0,10})(?:\.\d{1,3})?(?![\s\S])/;
export const pricePattern =
  /^(?=.*[1-9])(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?(?![\s\S])/;

export class ProductFieldsDto {
  @ApiProperty({ example: 'Tomatoes' })
  @IsString()
  @Length(2, 150)
  @Matches(/\S/)
  name!: string;
  @ApiProperty({ example: 'Vegetables' })
  @IsString()
  @Length(2, 80)
  @Matches(/\S/)
  category!: string;
  @ApiProperty({ example: 'Freshly harvested tomatoes' })
  @IsString()
  @Length(1, 2000)
  @Matches(/\S/)
  description!: string;
  @ApiProperty({ example: 'kg' })
  @IsString()
  @Length(1, 20)
  @Matches(/\S/)
  unit!: string;
  @ApiProperty({ example: '25.00', type: String })
  @IsString()
  @Matches(pricePattern)
  pricePerUnit!: string;
  @ApiProperty({ example: 'Coimbatore, Tamil Nadu' })
  @IsString()
  @Length(2, 200)
  @Matches(/\S/)
  location!: string;
  @ApiPropertyOptional({ type: [String], example: [] })
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  @MaxLength(2048, { each: true })
  images?: string[];
}

export class CreateProductDto extends ProductFieldsDto {
  @ApiProperty({ example: '500', type: String })
  @IsString()
  @Matches(quantityPattern)
  quantity!: string;
}

export class UpdateProductDto extends PartialType(ProductFieldsDto, {
  skipNullProperties: false,
}) {}

export class ProductQueryDto extends PageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}
