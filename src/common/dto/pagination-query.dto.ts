import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({ description: 'Limit of results' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  limit: number;

  @ApiProperty({ description: 'Shifting of results' })
  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  offset: number;
}
