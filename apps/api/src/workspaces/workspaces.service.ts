import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace } from './workspace.schema';
import { UsersService } from '../users/users.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '@devbrain/shared';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.workspaceModel.create({ userId, ...dto });
    await this.usersService.addWorkspace(userId, workspace._id.toString());
    return workspace;
  }

  async findAllByUser(userId: string): Promise<Workspace[]> {
    return this.workspaceModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.userId !== userId) throw new ForbiddenException();
    return workspace;
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    await this.findOne(id, userId);
    return this.workspaceModel.findByIdAndUpdate(id, dto, { new: true }) as unknown as Workspace;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.workspaceModel.findByIdAndDelete(id);
  }
}
