import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class SubmitDocumentRequestDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  nationalId: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  purpose: string;

  @IsString()
  @IsOptional()
  councilJurisdiction?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  citizenId?: string;
}
