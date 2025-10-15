import { Repository } from "typeorm";
import { Contribution } from "../entities";
export declare class contributionsService {
    private readonly contributionsRepository;
    constructor(contributionsRepository: Repository<Contribution>);
    findAll(): Promise<Contribution[]>;
    findOne(id: number): (options: import("typeorm").FindOneOptions<Contribution>) => Promise<Contribution | null>;
}
