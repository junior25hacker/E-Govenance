import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    citizenId: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    password: string;
}
