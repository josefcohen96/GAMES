import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,

    ) { }

    async createUser(dto: RegisterDto): Promise<{ message: string }> {
        const { username, password } = dto;
        console.log('Creating user with dto:', dto);
        if (!username || !password) {
            throw new BadRequestException('Username and password are required');
        }

        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new BadRequestException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            username,
            password: hashedPassword,
        });

        await this.userRepository.save(user);
        console.log('User created:', user);
        return { message: 'User created successfully' };
    }

    async login(dto: { username: string; password: string }): Promise<{ message: string, token: string, userId: User | null }> {
        const { username, password
        } = dto;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        console.log('User logged in:', user);
        const payload = { username: user.username, sub: user.id };
        const token = this.jwtService.sign(payload);
        console.log('Generated JWT token:', token);
        const userId = await this.userRepository.findOne({ where: { username } });
        return { message: 'Login successful', token, userId };
    }

    async updateUser(id: string, Body: { username?: string; password?: string }): Promise<{ message: string }> {
        // Logic to update a user
        const { username, password } = Body;
        console.log(`Updating user with id ${id} with data:`, Body);
        if (!username && !password) {
            throw new BadRequestException('At least one field (username or password) must be provided for update');
        }
        const updateData: Partial<User> = {};
        if (username) {
            updateData.username = username;
        }
        if (password) {
            updateData.password = bcrypt.hashSync(password, 10);
        }
        await this.userRepository.update(id, updateData);
        console.log(`User with id ${id} updated with data:`, updateData);
        return { message: 'User updated successfully' };
    }

    async deleteUser(id: string) {
        // Logic to delete a user

        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return { message: 'User deleted successfully' };
    }

    async getAllUsers(): Promise<User[]> {
        // Logic to get all users
        const users = await this.userRepository.find();
        console.log('Retrieved all users:', users);
        return users;
    }

    async findById(id: string): Promise<User | null> {
        // Logic to find a user by ID
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        console.log(`User found with ID ${id}:`, user);
        return user;
    }
}
