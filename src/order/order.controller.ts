import { Controller, Get, Post, Body, ClassSerializerInterceptor, UseInterceptors, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { Link } from '../link/link';
import { LinkService } from '../link/link.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemService } from './order-item.service';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config/dist';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private linkService: LinkService,
    private productService: ProductService,
    private orderItemService: OrderItemService,
    private datasource: DataSource,
    private configService: ConfigService,
    private eventEmiter: EventEmitter2

  ) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('admin/orders')
  all() {

    console.log(`${this.configService.get('TEST_URL')}`);

    return this.orderService.find({
      relations: ['order_items']
    });
  }

  @Post('checkout/orders')
  async create(@Body() body: CreateOrderDto) {
    const link: Link = await this.linkService.findOne({
      where: {
        code: body.code
      },
      relations: ['user']
    });

    if (!link) {
      throw new BadRequestException('Invalid Link');
    }

    //transaction
    const queryRunner = this.datasource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const o = new Order();
      o.user_id = link.user.id.toString();
      o.ambassador_email = link.user.email;
      o.first_name = body.first_name;
      o.last_name = body.last_name;
      o.email = body.email;
      o.address = body.address;
      o.country = body.country;
      o.city = body.city;
      o.zip = body.zip;
      o.code = body.code;

      const order = await queryRunner.manager.save(o);

      for (let p of body.products) {
        const product = await this.productService.findOne({ where: { id: p.product_id } });

        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.product_title = product.title;
        orderItem.price = product.price;
        orderItem.quantity = p.quantity;
        orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
        orderItem.admin_revenue = 0.1 * product.price * p.quantity;

        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();

      return order;

    } catch (error) {

      console.log(error);

      await queryRunner.rollbackTransaction();

      throw new BadRequestException();
    }
    finally {
      await queryRunner.release();
    }

  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('checkout/orders/confirm')
  async confirm(@Body ('source') source: string)  {

      const order = await this.orderService.findOne({

        where: {transaction_id: source} ,
        relations: ['user', 'order_items']

      });

      if (!order){
        throw new NotFoundException('Order not found')
      }

      await this.orderService.update(order.id, {
        complete: true
      } );

      await this.eventEmiter.emit('order.completed', order);

      return {
        message: 'success'
      }

  }


}
