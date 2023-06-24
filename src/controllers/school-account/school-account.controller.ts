import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegionService } from 'src/services/region/region.service';
import { SchoolAccountService } from 'src/services/school-account/school-account.service';

@Controller('school-accounts')
export class SchoolAccountController {
  constructor(
    private schoolAccountService: SchoolAccountService,
    private readonly regionService: RegionService,
  ) {}

  @Get(':edebo')
  async getSchoolAccountByEdebo(@Param() params): Promise<ItemExist> {
    return firstValueFrom(
      this.schoolAccountService
        .isAccountWithEdeboExists(params.edebo)
        .pipe(map((isExist) => ({ exist: isExist }))),
    );
  }
}

export interface ItemExist {
  exist: boolean;
}
export interface SchoolAccountDto {
  organizer: userDto;
  school: SchoolDto;
}
export interface userDto {
  email: string;
  fatherName: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordRepeat: string;
  phoneNumber: string;
  role: number;
}

export interface SchoolDto {
  address: string;
  director: string;
  workStatus: boolean;
  edebo: number;
  fullName: string;
  koatuuName: string;
  ownership: string;
  schoolPhoneNumber: string;
  shortName: string;
  type: string;
}
