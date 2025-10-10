import { Module } from "@nestjs/common";
import { contributionsController } from "./contributions.controller";
import { ContributionsService } from "./contributions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contribution } from "../entities";
@Module({
    imports:[TypeOrmModule.forFeature([Contribution])],
    controllers:[contributionsController],
    providers:[ContributionsService]
})
export class contributionsModule{}