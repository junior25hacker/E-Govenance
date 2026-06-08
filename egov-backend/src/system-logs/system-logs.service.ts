import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemActivityLog, LogSeverity, SourceModule } from './entities/system-log.entity';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemActivityLog)
    private logsRepository: Repository<SystemActivityLog>,
  ) {}

  async createLog(data: Partial<SystemActivityLog>): Promise<SystemActivityLog> {
    const log = this.logsRepository.create(data);
    return await this.logsRepository.save(log);
  }

  async getLogsByUser(userId: string): Promise<SystemActivityLog[]> {
    return await this.logsRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async getRecentLogsByUser(userId: string, limit: number = 5): Promise<SystemActivityLog[]> {
    return await this.logsRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
