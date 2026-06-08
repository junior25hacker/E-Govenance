import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // POST /requests -> create request + auto add to tracking
  @Post('requests')
  async create(@Body() createRequestDto: CreateRequestDto) {
    const request = await this.requestsService.createRequest(createRequestDto, 'API User');
    return {
      status: 'success',
      data: request
    };
  }

  // GET /tracking -> get all active tracked requests
  @UseGuards(JwtAuthGuard)
  @Get('tracking')
  async getAllTracked(@Req() req) {
    return this.requestsService.getAllTrackedRequests(req.user.citizenId);
  }

  // GET /requests/pending -> get pending requests
  @UseGuards(JwtAuthGuard)
  @Get('requests/pending')
  async getPendingRequests(@Req() req) {
    return this.requestsService.getPendingRequests(req.user.citizenId);
  }

  // GET /requests/:id/tracking -> get request + tracking info
  @UseGuards(JwtAuthGuard)
  @Get('requests/:id/tracking')
  async getTrackingData(@Param('id') id: string, @Req() req) {
    const request = await this.requestsService.getRequestById(id, req.user.citizenId);
    return {
      status: 'success',
      data: request
    };
  }

  // GET /requests/:id -> get request + tracking info
  @UseGuards(JwtAuthGuard)
  @Get('requests/:id')
  async findOne(@Param('id') id: string, @Req() req) {
    const request = await this.requestsService.getRequestById(id, req.user.citizenId);
    return {
      status: 'success',
      data: request
    };
  }

  // PATCH /requests/:id/next-stage -> move to next stage
  @Patch('requests/:id/next-stage')
  async nextStage(
    @Param('id') id: string,
    @Body('status') status?: string,
    @Body('performedBy') performedBy?: string,
    @Body('description') description?: string
  ) {
    const request = await this.requestsService.nextStage(
      id,
      status,
      performedBy || 'Admin User',
      description
    );
    return {
      status: 'success',
      message: `Successfully advanced to ${request.currentStatus}`,
      data: request
    };
  }

  // GET /requests/:id/logs -> get activity log
  @UseGuards(JwtAuthGuard)
  @Get('requests/:id/logs')
  async getLogs(@Param('id') id: string, @Req() req) {
    const logs = await this.requestsService.getLogs(id, req.user.citizenId);
    return {
      status: 'success',
      data: logs
    };
  }
}
