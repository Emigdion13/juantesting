import { NestFactory } from "@nestjs/core";
import { faker } from '@faker-js/faker';
import { AppModule } from "../app.module";
import { RedisService } from "../shared/redis.service";
import { UserService } from "../user/user.service";
import { User } from "../user/user";

( async () => {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);

    const ambassadors : User[] = await userService.find({
      is_ambassador : true,
      relations: ['orders', 'orders.order_items']
    });

    const redisService = app.get(RedisService);

    const client = redisService.getClient();

    for (let i = 0; i < ambassadors.length; i++) {
      client.zadd( "ranking", ambassadors[i].revenue, ambassadors[i].name  );
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
  
