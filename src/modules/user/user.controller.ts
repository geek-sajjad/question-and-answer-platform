import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.services';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //Note: This is simple method just for creating users in test env for testing app functionality
  @Post('')
  create(@Body() userDto: CreateUserDto) {
    return this.userService.create(userDto);
  }

  //Note: This is simple find method for testing, no pagination required here.
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
