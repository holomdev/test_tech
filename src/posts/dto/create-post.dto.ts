import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsString()
  readonly title: string;

  @ApiProperty({ description: 'The body of the post' })
  @IsString()
  readonly body: string;
}
