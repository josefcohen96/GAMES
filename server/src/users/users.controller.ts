import { Body, Controller, Delete, Param, Patch, Post, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Define your endpoints here, e.g.:
    // @Post()  - create a user
    // @Patch(':id')  - update a user
    // @Delete(':id')  - delete a user


    @Post('create')
     async createUser(@Body() dto: RegisterDto) {
        return this.usersService.createUser(dto);
    }
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.usersService.login(dto);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() user: {}) {
        return this.usersService.updateUser(id, user);
    }

    @Delete(':id') 
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }

    @Get('getAll')
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

}
