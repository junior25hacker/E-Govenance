"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitSyncService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
let GitSyncService = class GitSyncService {
    async syncFromEnv() {
        const repoUrl = process.env.GIT_REPO_URL;
        const branch = process.env.GIT_BRANCH || 'main';
        const workdir = process.env.GIT_WORKDIR || (0, path_1.join)(process.cwd(), 'synced-repo');
        if (!repoUrl) {
            throw new common_1.BadRequestException('Missing env: GIT_REPO_URL');
        }
        const gitDir = (0, path_1.join)(workdir, '.git');
        const repoExists = (0, fs_1.existsSync)(workdir);
        const isGitRepo = (0, fs_1.existsSync)(gitDir);
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
            throw new common_1.BadRequestException(`${workdir} is not a git repository`);
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
};
exports.GitSyncService = GitSyncService;
exports.GitSyncService = GitSyncService = __decorate([
    (0, common_1.Injectable)()
], GitSyncService);
//# sourceMappingURL=git-sync.service.js.map