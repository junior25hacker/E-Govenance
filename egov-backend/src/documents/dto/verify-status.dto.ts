import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class VerifyStatusDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['verified', 'rejected'])
    status: string;

    @IsString()
    @IsNotEmpty()
    verifiedBy: string;
}
