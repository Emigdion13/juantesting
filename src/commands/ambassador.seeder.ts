import { NestFactory } from "@nestjs/core";
import { UserService } from "../user/user.service";
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { AppModule } from "../app.module";

( async () => {
    const app = await NestFactory.createApplicationContext(AppModule);



    const userService = app.get(UserService);
    const password = await bcrypt.hash("1234", 12);

    for (let i = 0; i < 1; i++) {
        await userService.save({
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email(),
            password,
            is_ambassador: false
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
  
