import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export interface GitSyncResult {
  status: 'success' | 'error';
  operation: 'clone' | 'pull';
  branch: string;
  workdir: string;
  stdout: string;
  stderr: string;
}

@Injectable()
export class GitSyncService {
  async syncFromEnv(): Promise<GitSyncResult> {
    const repoUrl = process.env.GIT_REPO_URL;
    const branch = process.env.GIT_BRANCH || 'main';
    const workdir = process.env.GIT_WORKDIR || join(process.cwd(), 'synced-repo');

    if (!repoUrl) {
      throw new BadRequestException('Missing env: GIT_REPO_URL');
    }

    // Ensure deterministic working directory.
    // Note: we never accept user-provided paths.
    const gitDir = join(workdir, '.git');
    const repoExists = existsSync(workdir);
    const isGitRepo = existsSync(gitDir);

    if (!repoExists) {
      await execFileAsync('git', ['clone', '--branch', branch, repoUrl, workdir]);
      return {
        status: 'success',
        operation: 'clone',
        branch,
        workdir,
        stdout: `Cloned ${repoUrl} to ${workdir}`,
        stderr: '',
      };
    }

    if (!isGitRepo) {
      throw new BadRequestException(`${workdir} is not a git repository`);
    }

    await execFileAsync('git', ['pull', 'origin', branch], { cwd: workdir });
    return {
      status: 'success',
      operation: 'pull',
      branch,
      workdir,
      stdout: `Pulled ${branch} in ${workdir}`,
      stderr: '',
    };
  }
}

