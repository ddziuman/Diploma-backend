import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from } from 'rxjs';
import { User } from 'src/user/user';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJWT(user: User): Observable<string> {
    console.log(user);
    // 'user' is a property of JWT payload object
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string, saltRounds: number): Observable<string> {
    return from(bcrypt.hash(password, saltRounds));
  }

  comparePasswords(
    enteredPassword: string,
    passwordHash: string,
  ): Observable<boolean> {
    return from(bcrypt.compare(enteredPassword, passwordHash));
  }
}
