import { 
    CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OnEvent } from "@nestjs/event-emitter";;

@Injectable()
export class ProductListener {

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    @OnEvent('product_updated')
    async ProductUpdatedEvent(){
        
        console.log('Product changed detected');
        await this.cacheManager.del('products_frontend');
        await this.cacheManager.del('products_backend');

    }

}