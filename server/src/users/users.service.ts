import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Users } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createUser(dto: RegisterDto): Promise<{ message: string }> {
    const { username, password } = dto;
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return { message: 'User created successfully' };
  }

  async updateUser(
    id: string,
    Body: { username?: string; password?: string },
  ): Promise<{ message: string }> {
    const { username, password } = Body;
    if (!username && !password) {
      throw new BadRequestException(
        'At least one field (username or password) must be provided for update',
      );
    }
    const updateData: Partial<Users> = {};
    if (username) {
      updateData.username = username;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await this.userRepository.update(id, updateData);
    return { message: 'User updated successfully' };
  }

  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: 'User deleted successfully' };
  }

  async getAllUsers(): Promise<Users[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findById(id: string): Promise<Users | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    return user;
  }
  async findOne(username: string): Promise<Users | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      return null;
    }
    return user;
  }
}
