import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^[A-Za-z]{2,20}$/, { message: 'Имя: латиница, от 2 до 20 символов' })
  name!: string;
}
