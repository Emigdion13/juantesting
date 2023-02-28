import { 
    Controller, Get, Body, Post, Param, Put, Delete, 
    CacheKey, CacheTTL, CacheInterceptor, UseInterceptors, 
    CACHE_MANAGER, Inject, Req } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';
import { Request } from 'express';
import { Product } from './product';

@Controller()
export class ProductController {

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly productService: ProductService,
        private eventEmitter: EventEmitter2
        
    ) {}
    
    @Get('admin/products')
    async all(){
        return this.productService.find({});
    }

    @Post('admin/products')
    async create(@Body() body: ProductCreateDto ) {
        const product = await this.productService.save(body);
        this.eventEmitter.emit('product_updated');
        return product;
    }

    @Get('admin/products/:id')
    async get(@Param('@id') id : number){
        return this.productService.findOne({id});
    }

    @Put('admin/products/:id')
    async update(
        @Param('id') id : number,
        @Body() body: ProductCreateDto
        ){
            await this.productService.update(id,body);

            this.eventEmitter.emit('product_updated');

            return this.productService.findOne({where : {id} });
    }

    @Delete('admin/products/:id')
    async delete(
        @Param('id') id : number,
        ){
            const response = this.productService.delete(id);
            this.eventEmitter.emit('product_updated');
            return response;
    }
    


    @CacheKey('products_frontend')
    @CacheTTL(1800) // this is in seconds, so 30 minutes
    @UseInterceptors(CacheInterceptor)
    @Get('ambassador/products/frontend')
    async frontend(){

            return this.productService.find();
    }

    @Get('ambassador/products/backend')
    async backend(
        @Req() request: Request
    ){

        let product = await this.cacheManager.get<Product[]>('products_backend');

        if (!product){
            product = await this.productService.find();

            await this.cacheManager.set('products_backend', product, {ttl: 1800})
        }

        if (request.query) // s is search variable
        {
            const s = request.query.s.toString().toLowerCase();
            product = product.filter( p => p.title.toLowerCase().indexOf(s) >= 0);
        }

        const total = product.length;

        if (request.query.sort === 'asc' || request.query.sort === 'des')
        {
            product.sort(( a , b ) =>  { 
                const diff = a.price - b.price;

                if (diff === 0) return 0;

                const sign = Math.abs(diff) / diff;

                return request.query.sort === 'asc' ? sign : -sign;
            } );
        }

        const page = parseInt(request.query.page as any) || 1;
        const perPage = 9;

        product = product.slice( (page -1)  * perPage, page * perPage );


        return { 
            
            product,
            total,
            page,
            last_page: Math.ceil(total / perPage)

        };
    }


}
