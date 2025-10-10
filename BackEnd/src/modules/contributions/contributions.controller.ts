import { Controller, Get } from "@nestjs/common";
import { contributionsService } from "./contributions.service";

@Controller("contributions")
export class contributionsController{
    constructor(private readonly contributionsService:contributionsService){}

    @Get()
    findAll(){
        return this.contributionsService.findAll();
    // @Get(":id")
    // findOne 
}
    
}