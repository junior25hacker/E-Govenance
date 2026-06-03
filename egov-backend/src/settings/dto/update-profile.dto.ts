import { IsOptional, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  nationalId?: string;
}
