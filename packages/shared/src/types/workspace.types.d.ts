export interface Workspace {
    _id: string;
    userId: string;
    name: string;
    stack: string[];
    gitPath?: string;
    score: number;
    createdAt: Date;
}
export interface CreateWorkspaceDto {
    name: string;
    stack: string[];
    gitPath?: string;
}
export interface UpdateWorkspaceDto {
    name?: string;
    stack?: string[];
    gitPath?: string;
}
//# sourceMappingURL=workspace.types.d.ts.map