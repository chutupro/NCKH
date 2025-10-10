import { Module } from "@nestjs/common";
import { contributionsController } from "./contributions.controller";
import { contributionsService } from "./contributions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contribution } from "../entities";
@Module({
    imports:[TypeOrmModule.forFeature([Contribution])],
    controllers:[contributionsController],
    providers:[contributionsService]
})
export class contributionsModule{}