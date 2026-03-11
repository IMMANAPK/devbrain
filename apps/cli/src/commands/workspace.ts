import chalk from 'chalk';
import { getClient } from '../api.js';
import { config } from '../config.js';

export async function workspaceListCommand() {
  try {
    const { data } = await getClient().get('/workspaces');
    const current = config.get('workspaceId');

    console.log(chalk.cyan('\nWorkspaces:\n'));
    data.forEach((ws: any) => {
      const marker = ws._id === current ? chalk.green('* ') : '  ';
      console.log(`${marker}${chalk.bold(ws.name)} ${chalk.gray(`[${ws._id}]`)}`);
      console.log(`   Stack: ${ws.stack.join(', ')}`);
    });
  } catch {
    console.error(chalk.red('Failed to fetch workspaces'));
    process.exit(1);
  }
}

export async function workspaceUseCommand(id: string) {
  config.set('workspaceId', id);
  console.log(chalk.green(`✓ Active workspace set to: ${id}`));
}
