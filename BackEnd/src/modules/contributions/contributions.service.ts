import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Contribution } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class contributionsService{
    constructor(@InjectRepository(Contribution)private readonly contributionsRepository:Repository<Contribution> ){}

    findAll(){
        return this.contributionsRepository.find({ relations: ['article', 'user', 'moderationLogs'] });
    }
    findOne(id:number){
        return this.contributionsRepository.findOne 
    }
}