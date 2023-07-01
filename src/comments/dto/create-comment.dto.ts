import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  readonly postId: number;

  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly body: string;
}
