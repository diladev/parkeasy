import {
  Controller,
  Get,
  Header,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';

/**
 * For the host (Render) and uptime checks: 200 while the API can reach its
 * database, 503 when it can't, so a broken instance isn't sent traffic.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Is the API up, and can it reach the database?' })
  async check(): Promise<{ status: 'ok' }> {
    try {
      await this.sequelize.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('The database is not reachable.');
    }
    return { status: 'ok' };
  }
}
