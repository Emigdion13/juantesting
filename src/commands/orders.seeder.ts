import { NestFactory } from "@nestjs/core";
import { faker } from '@faker-js/faker';
import { AppModule } from "../app.module";
import { OrderService } from "../order/order.service";
import { OrderItemService } from "../order/order-item.service";
import { randomInt } from "crypto";

( async () => {
    const app = await NestFactory.createApplicationContext(AppModule);

    const orderService = app.get(OrderService);
    const orderItemService = app.get(OrderItemService);

    for (let i = 0; i < 1; i++) {
        const order = await orderService.save({
            user_id: randomInt(2,31),
            code: faker.lorem.slug(2),
            ambassador_email: faker.internet.email(),
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email(),
            complete: true
        });

        for (let p = 0; p < randomInt(1,5); p++) {
          const mama = await orderItemService.save({
            order,
            product_title: faker.lorem.words(2),
            price: randomInt(10, 100),
            quantity: randomInt(1,5),
            admin_revenue : randomInt(10, 100),
            ambassador_revenue: randomInt(1, 10)
          });
        }
    }

    await delay(1000);

    process.exit();

  } )();

  function delay(ms: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
  
