import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';
import { HomeSectionsService } from './home-sections.service';

@Controller('home-sections')
export class HomeSectionsController {
  constructor(private readonly homeSectionsService: HomeSectionsService) {}

  @Get()
  findAll() {
    return this.homeSectionsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.homeSectionsService.findActiveForApp();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeSectionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateHomeSectionDto) {
    return this.homeSectionsService.update(id, updateDto);
  }

  @Post(':id/restaurants')
  addRestaurant(
    @Param('id') id: string,
    @Body('restaurantId') restaurantId: string,
  ) {
    return this.homeSectionsService.addRestaurant(id, restaurantId);
  }

  @Delete(':id/restaurants/:restaurantId')
  removeRestaurant(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.homeSectionsService.removeRestaurant(id, restaurantId);
  }
}
