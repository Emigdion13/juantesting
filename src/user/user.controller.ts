import { Controller, Get, UseGuards } from '@nestjs/common';
import { Res, UseInterceptors } from '@nestjs/common/decorators';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { RedisService } from '../shared/redis.service';
import { User } from './user';
import { UserService } from './user.service';


@Controller('users')
//@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(
        private readonly userService: UserService,
        private redisService: RedisService,

    ) {

    }

    @Get('ambassadors')
    async ambassadors() {

        return this.userService.find({ where: { is_ambassador: true } });

    }

    @Get('ambassador/rankings')
    async rankings(
        @Res() response: Response

    ) {

        const client = this.redisService.getClient();


        client.zrevrangebyscore('rankings', '+inf', '-inf', 'withscores', (err, result) => {
            response.send(result);

            console.log(err);
            console.log(result);
        });

        return;

        const ambassadors: User[] = await this.userService.find(
            {
                where: { is_ambassador: true }, relations: ['orders', 'orders.order_items']
            });

        return ambassadors.map(ambassadors => {

            return {
                name: ambassadors.name,
                revenue: ambassadors.revenue
            }

        });

    }

}
