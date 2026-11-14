import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Demo Farmer' })
  @IsString()
  @Length(2, 100)
  @Matches(/\S/)
  name!: string;

  @ApiProperty({ example: 'farmer@example.test' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: '+919000000001' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone?: string;

  @ApiProperty({ minLength: 10, maxLength: 72 })
  @IsString()
  @Length(10, 72)
  @Matches(/^[\x20-\x7E]+$/, {
    message:
      'password must contain printable ASCII characters (bcrypt maximum: 72 bytes)',
  })
  password!: string;

  @ApiProperty({ enum: ['FARMER', 'BUYER'] })
  @IsIn(['FARMER', 'BUYER'])
  role!: 'FARMER' | 'BUYER';
}

export class LoginDto {
  @ApiProperty({
    description: 'Email or exact registered phone number',
    example: 'farmer@example.test',
  })
  @IsString()
  @Length(3, 254)
  identifier!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 72)
  password!: string;
}
