import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getMyProfile(@Req() request) {
    return this.usersService.getUser(request.user.uid);
  }

  @Patch('service')
  async updateService(@Req() request, @Body('serviceType') serviceType: 'metro' | 'orange' | 'speedo') {
    return this.usersService.updateServiceType(request.user.uid, serviceType);
  }

  @Patch('update')
  async updateProfile(@Req() request, @Body() updateData: any) {
    return this.usersService.updateProfile(request.user.uid, updateData);
  }
}
