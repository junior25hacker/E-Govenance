import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    citizenId: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
