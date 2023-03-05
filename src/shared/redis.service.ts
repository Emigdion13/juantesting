import { CACHE_MANAGER } from "@nestjs/common/cache";
import { Get, Inject, Injectable } from "@nestjs/common/decorators";
import { Cache } from "cache-manager";

@Injectable()
export class RedisService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ){}

    
    getClient() {
        const store : any = this.cacheManager.store;
        return store.getClient();
    }
}