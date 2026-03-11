import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateNoteDto, SearchNotesDto } from '@devbrain/shared';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateNoteDto) {
    return this.notesService.create({ ...dto, userId: user.userId });
  }

  /** GET /notes/stats — total note count for the authenticated user */
  @Get('stats')
  stats(@CurrentUser() user: any) {
    return this.notesService.countForUser(user.userId).then((count) => ({ count }));
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.notesService.findAllByWorkspace(workspaceId);
  }

  @Get('search')
  search(@Query() dto: SearchNotesDto) {
    return this.notesService.search(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { rawContent?: string; tags?: string[] }) {
    return this.notesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
