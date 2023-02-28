import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderItemService } from './order-item.service';
import { SharedModule } from '../shared/shared.module';
import { LinkModule } from '../link/link.module';
import { ProductService } from '../product/product.service';
import { ProductModule } from '../product/product.module';
import { OrderListener } from './listeners/order.listener';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    SharedModule,
    LinkModule,
    ProductModule,
    MailerModule.forRoot({
      transport: {
        host: 'host.docker.internal', //host.docker.internal:8080
        port: 1025
      },
      defaults: {
        from: 'no-reply@example.com'
      }
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService, OrderListener]
})
export class OrderModule { }
