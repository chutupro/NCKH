import { contributionsService } from "./contributions.service";
export declare class contributionsController {
    private readonly contributionsService;
    constructor(contributionsService: contributionsService);
    findAll(): Promise<import("../entities").Contribution[]>;
}
