import { Injectable } from '@nestjs/common';
import { AbstractService } from '../shared/abstract.service';
import { Repository } from 'typeorm';
import { User } from './user';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService extends AbstractService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
        super(userRepository);
    }


}
