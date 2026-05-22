import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyDocumentDto {
    @IsString()
    @IsNotEmpty()
    docType: string;

    @IsString()
    @IsNotEmpty()
    docPath: string;
}
