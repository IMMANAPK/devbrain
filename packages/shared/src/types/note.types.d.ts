export type NoteSource = 'web' | 'cli' | 'git-commit';
export interface Note {
    _id: string;
    workspaceId: string;
    rawContent: string;
    enrichedContent?: string;
    tags: string[];
    interviewQs: string[];
    vectorId?: string;
    source: NoteSource;
    createdAt: Date;
}
export interface CreateNoteDto {
    workspaceId: string;
    rawContent: string;
    tags?: string[];
    source?: NoteSource;
}
export interface SearchNotesDto {
    query: string;
    workspaceId?: string;
    tags?: string[];
}
//# sourceMappingURL=note.types.d.ts.map