import { NestFactory } from "@nestjs/core";
import { faker } from '@faker-js/faker';
import { AppModule } from "../app.module";
import { ProductService } from "../product/product.service";
import { randomInt } from "crypto";

( async () => {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(ProductService);

    for (let i = 0; i < 50; i++) {
        await userService.save({
          title: faker.lorem.words(2),
          description: faker.lorem.words(10),
          image: faker.image.imageUrl(200,200,'', true),
          price: randomInt(10,100)
        });
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
  
