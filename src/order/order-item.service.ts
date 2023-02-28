import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '../shared/abstract.service';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderItemService extends AbstractService {
  constructor(
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>){
        super(orderItemRepository);
}


}
