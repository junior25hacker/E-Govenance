import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsNotEmpty()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  publicProfile?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  shareWithAgencies?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  twoFactorAuth?: boolean;
}
