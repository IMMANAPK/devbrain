import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InterviewService, AskDto } from './interview.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /** POST /interview/ask  { question, workspaceId? } */
  @Post('ask')
  ask(@Body() dto: AskDto) {
    return this.interviewService.ask(dto);
  }
}
