import { isEmpty, IsNumberString, IsOptional } from "class-validator";

export class ProductCreateDto {
   
    @IsOptional()
    title?: string;

    @IsOptional()
    description?: string;

    @IsOptional()
    image?: string;

    @IsOptional()
    //@IsNumberString()
    price?: string;
}