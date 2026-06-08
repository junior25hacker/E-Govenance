export interface GitSyncResult {
    status: 'success' | 'error';
    operation: 'clone' | 'pull';
    branch: string;
    workdir: string;
    stdout: string;
    stderr: string;
}
export declare class GitSyncService {
    syncFromEnv(): Promise<GitSyncResult>;
}
