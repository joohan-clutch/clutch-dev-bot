import { Repository } from "typeorm";
import { AppDataSource } from "../AppDataSource";
import { TechRequest } from "../entity/TechRequest";

export class TechRequestService {
  private readonly techRequestRepository: Repository<TechRequest>;

  constructor() {
    this.techRequestRepository = AppDataSource.getRepository(TechRequest);
  }

  public async getTechRequest(
    channelId: string,
    messageId: string,
  ): Promise<TechRequest | null> {
    return this.techRequestRepository.findOneBy({
      channelId,
      messageId,
    });
  }

  public async createTechRequest(
    channelId: string,
    messageId: string,
    currentOnCallUserSlackId: string,
    text: string,
  ): Promise<TechRequest> {
    const techRequest = this.techRequestRepository.create(
      new TechRequest(channelId, messageId, currentOnCallUserSlackId, text),
    );

    return this.techRequestRepository.save(techRequest);
  }
}

export const techRequestService = new TechRequestService();
