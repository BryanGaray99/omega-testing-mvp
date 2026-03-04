import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

/**
 * DTO for confirming reset all data (Danger Zone).
 * User must type exactly "RESET ALL DATA" to confirm.
 */
export class ResetDataDto {
  @ApiProperty({
    example: 'RESET ALL DATA',
    description: 'Must be exactly "RESET ALL DATA" to confirm',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^RESET ALL DATA$/, {
    message: 'Confirmation must be exactly "RESET ALL DATA" (case-sensitive)',
  })
  confirmation: string;
}
