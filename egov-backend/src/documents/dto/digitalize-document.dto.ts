import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO for the "Digitalize New Document" form.
 * The actual file is handled by Multer (@UploadedFile), not via this DTO.
 */
export class DigitalizeDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType: string; // e.g., "Birth Certificate", "Certificate of Origin"

  @IsString()
  @IsNotEmpty()
  fullName: string; // Citizen's full legal name

  @IsString()
  @IsNotEmpty()
  nationalId: string; // National ID number

  @IsString()
  @IsOptional()
  councilJurisdiction?: string; // e.g., "Central Registry", "Buea Council"
}
