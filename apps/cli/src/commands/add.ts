import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../api.js';
import { config } from '../config.js';

export async function addCommand(content: string, opts: { tags?: string; workspace?: string }) {
  const workspaceId = opts.workspace ?? config.get('workspaceId');

  if (!workspaceId) {
    console.error(chalk.red('✗ No workspace set. Run: devbrain workspace use <id>'));
    process.exit(1);
  }

  const spinner = ora('Saving note...').start();
  try {
    const client = getClient();
    const tags = opts.tags ? opts.tags.split(',').map((t) => t.trim()) : [];

    await client.post('/notes', {
      workspaceId,
      rawContent: content,
      tags,
      source: 'cli',
    });

    spinner.succeed(chalk.green('Note saved!'));
  } catch (err: any) {
    spinner.fail(chalk.red('Failed to save note'));
    if (err.response?.status === 401) {
      console.error(chalk.yellow('  Run: devbrain login <email> <password>'));
    }
    process.exit(1);
  }
}
