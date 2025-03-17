import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() userData: { email: string; password: string; phoneNumber: string },
  ) {
    return this.authService.registerUser(
      userData.email,
      userData.password,
      userData.phoneNumber,
    );
  }

  @Post('login')
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.loginUser(credentials.email, credentials.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() request) {
    return this.authService.getUserProfile(request.user.uid);
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async updateUser(@Req() request, @Body() updateData: any) {
    return this.authService.updateUserProfile(request.user.uid, updateData);
  }

  @Delete('delete')
  @UseGuards(AuthGuard)
  async deleteUser(@Req() request) {
    return this.authService.deleteUser(request.user.uid);
  }
  @Post('admin/login')
  async adminLogin(@Body('token') token: string) {
    const user = await this.authService.verifyToken(token);

    if (!user.isAdmin) {
      throw new HttpException(
        new BadRequestException('Access denied. Only admins can log in here.'),
        400,
      );
    }

    return {
      message: 'Admin login successful',
      uid: user.uid,
      email: user.email,
    };
  }
}
