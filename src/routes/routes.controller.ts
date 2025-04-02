import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('routes')
export class RoutesController {
  constructor(private readonly service: RoutesService) {}

  @Get()
  async getRoutes() {
    return this.service.getAllRoutes();
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.service.createRoute(body);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.updateRoute(id, body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.deleteRoute(id);
  }
}
