import { Body, ClassSerializerInterceptor, Controller, Get, HttpException, HttpStatus, Post, Put, Req, Res, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDTO } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { User } from '../user/user';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) //This is what Limits the query results using user.ts decorations
export class AuthController {

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {

    }

    @Post(['admin/register', 'ambassador/register'])
    async register(
        @Body() body: RegisterDTO,
        @Req() request: Request
    ): Promise<void> {

        const { password_confirmation, ...data } = body;

        if (body.password !== body.password_confirmation) {
            throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
        }

        const hashed = await bcrypt.hash(body.password, 12);

        return this.userService.save(
            {
                ...data,
                password: hashed,
                is_ambassador: () => {
                    const pattern = /ambassador\/register$/;
                    return pattern.test(request.path.toLowerCase().trimEnd());
                }
            });
    }

    @Post(['admin/login', 'ambassador/login'])
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({ passthrough: true }) response: Response, //Send the cookie from the backend to the frontend
        @Req() request: Request
    ): Promise<{ [key: string]: string }> {
        const user = await this.userService.findOne({ where :  { email }  });

        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new HttpException("Invalid credentials", HttpStatus.BAD_REQUEST);
        }

        const regEx = /admin\/login$/;

        const adminLogin = regEx.test(request.path.toLowerCase().trim());

        if (user.is_ambassador && adminLogin) {

            throw new UnauthorizedException();

        }

        const jwt = await this.jwtService.signAsync({
            id: user.id,
            scope: adminLogin ? 'admin' : 'ambassador'
        });

        response.cookie('jwt', jwt, { httpOnly: true });

        return {
            message: "Success"
        };
    }

    @UseGuards(AuthGuard)
    @Get(['admin/user', 'ambassador/user'])
    async user(@Req() request: Request) {

        const cookie = request.cookies['jwt'];

        const { id } = await this.jwtService.verifyAsync(cookie);

        if (request.path.toLowerCase().trim() === '/api/admin/user') {
            const user = await this.userService.findOne({ where : { id } });
            return user;
        }

        const user = await this.userService.findOne({ where: id , relations: ['orders', 'orders.order_items'] });

        const {orders, password, ...data  } = user;

        return {
            ...data,
            revenue: user.revenue
        }

    }

    @Post(['admin/logout', 'ambassador/logout'])
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'success'
        }
    }

    @UseGuards(AuthGuard)
    @Put(['admin/users/info', 'ambassador/user/info'])
    async updateInfo(
        @Req() request: Request,
        @Body('first_name') first_name: string,
        @Body('last_name') last_name: string,
        @Body('email') email: string,

    ) {

        const cookie = request.cookies['jwt'];

        const { id } = await this.jwtService.verifyAsync(cookie);

        await this.userService.update(id, {
            first_name,
            last_name,
            email
        });

        return await this.userService.findOne({ id });

    }

    @UseGuards(AuthGuard)
    @Put(['admin/users/password', 'ambassador/user/password'])
    async updatePassword(
        @Req() request: Request,
        @Body('password') password: string,
        @Body('password_confirmation') password_confirmation: string,
    ) {

        const cookie = request.cookies['jwt'];

        const { id } = await this.jwtService.verifyAsync(cookie);

        if (!password || password !== password_confirmation) {
            throw new HttpException("Passwords doesn't match", HttpStatus.EXPECTATION_FAILED);
        }

        const _password = await bcrypt.hash(password, 12);

        await this.userService.update(id, {
            password: _password,
        });

        return await this.userService.findOne({ id });

    }



}