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
    findOne(id: number) {
    return this.contributionsRepository.findOne({
      where: { ContributionID: id },
      relations: ['article', 'user', 'moderationLogs'],
    });
  }
  create(contributionData: Partial<Contribution>) {
    const contribution = this.contributionsRepository.create(contributionData);
    contribution.SubmittedAt = new Date();
    return this.contributionsRepository.save(contribution);
  }

  async update(id: number, contributionData: Partial<Contribution>) {
    contributionData.SubmittedAt = new Date();
    await this.contributionsRepository.update(id, contributionData);
    return this.contributionsRepository.findOneBy({ ContributionID: id });
  }

  async delete(id: number) {
    const contribution = await this.contributionsRepository.findOneBy({ ContributionID: id });
    await this.contributionsRepository.delete(id);
    return contribution;
  }
}
