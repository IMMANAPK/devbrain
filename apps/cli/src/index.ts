#!/usr/bin/env node
import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { addCommand } from './commands/add.js';
import { searchCommand } from './commands/search.js';
import { workspaceListCommand, workspaceUseCommand } from './commands/workspace.js';

const program = new Command();

program
  .name('devbrain')
  .description('Your developer second brain')
  .version('1.0.0');

program
  .command('login <email> <password>')
  .description('Login to DevBrain')
  .action(loginCommand);

program
  .command('add <content>')
  .description('Add a new note')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-w, --workspace <id>', 'Workspace ID')
  .action(addCommand);

program
  .command('search <query>')
  .description('Search your notes')
  .action(searchCommand);

const workspace = program.command('workspace').description('Manage workspaces');
workspace.command('list').description('List all workspaces').action(workspaceListCommand);
workspace.command('use <id>').description('Set active workspace').action(workspaceUseCommand);

program.parse();
