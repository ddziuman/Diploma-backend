import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/user/user';
import {
  ItemExist,
  SchoolAccountDto,
} from 'src/controllers/school-account/school-account.controller';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  create(
    @Body() schoolAccountDto: SchoolAccountDto,
  ): Observable<{ organizerId: number }> {
    return this.userService
      .createOrganizer(schoolAccountDto)
      .pipe(map((user) => ({ organizerId: user.id })));
  }

  @Get(':email')
  getUserByEmail(@Param() params): Observable<User> {
    return this.userService.getUserByEmail(params.email, true);
  }

  @Get('exist/:email')
  isUserExist(@Param() params): Promise<ItemExist> {
    return firstValueFrom(
      this.userService
        .isUserExistsByEmail(params.email)
        .pipe(map((isExist) => ({ exist: isExist }))),
    );
  }

  @Post('login')
  login(@Body() user: User): Observable<{ JWT: string }> {
    return this.userService
      .login(user)
      .pipe(map((jwt: string) => ({ JWT: jwt })));
  }

  @Get('byId/:id')
  getUserById(@Param() params): Observable<User> {
    return this.userService.getUserById(+params.id);
  }
}
