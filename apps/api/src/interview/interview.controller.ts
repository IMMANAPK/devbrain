import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InterviewService, AskDto } from './interview.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /** POST /interview/ask  { question, workspaceId? }
   *  Full RAG + LLM pipeline (Claude/Ollama) — kept for CLI & fallback */
  @Post('ask')
  ask(@Body() dto: AskDto) {
    return this.interviewService.ask(dto);
  }

  /** POST /interview/context  { question, workspaceId? }
   *  RAG retrieval only — returns systemPrompt + sources for frontend Puter.js */
  @Post('context')
  getContext(@Body() dto: AskDto) {
    return this.interviewService.getContext(dto);
  }
}
