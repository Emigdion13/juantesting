import { MailerService } from "@nestjs-modules/mailer/dist";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RedisService } from "../../shared/redis.service";
import { Order } from "../entities/order.entity";

@Injectable()
export class OrderListener {

    constructor(
        private redisService: RedisService,
        //private mailerService: MailerService
    ){}

    @OnEvent('order.completed')
    async handleOrderCompletedEvent(order: Order) {

        //console.log(order);

        const client = this.redisService.getClient();
        client.zincrby('rankings', order.ambassador_revenue, order.user.name);

        /*await this.mailerService.sendMail({

            to: 'admin@admin.com',
            subject: 'An order has been completed',
            html: `Order #${order.id} with total of 100 has been completed!`
        });

        await this.mailerService.sendMail({

            to: order.ambassador_email,
            subject: 'An order has been completed',
            html: `Order #${order.id} with total of 50 has been completed! from link asd`
        });*/

    }

}