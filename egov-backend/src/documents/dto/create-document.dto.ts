import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    documentType: string;

    @IsString()
    @IsNotEmpty()
    councilJurisdiction: string;

    @IsString()
    @IsNotEmpty()
    filePath: string; // Used for extra metadata or file path
}
