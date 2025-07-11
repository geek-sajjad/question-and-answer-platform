import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.repo.create({
      email: createUserDto.email,
      name: createUserDto.name,
    });

    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }

  findOneById(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
