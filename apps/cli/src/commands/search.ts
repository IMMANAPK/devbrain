import chalk from 'chalk';
import { getClient } from '../api.js';
import { config } from '../config.js';

export async function searchCommand(query: string) {
  const workspaceId = config.get('workspaceId');
  try {
    const client = getClient();
    const params: any = { query };
    if (workspaceId) params.workspaceId = workspaceId;

    const { data } = await client.get('/notes/search', { params });

    if (data.length === 0) {
      console.log(chalk.yellow('No notes found for: ' + query));
      return;
    }

    console.log(chalk.cyan(`\nFound ${data.length} note(s):\n`));
    data.forEach((note: any, i: number) => {
      console.log(chalk.bold(`${i + 1}. ${note.rawContent}`));
      if (note.tags?.length) {
        console.log(chalk.gray('   Tags: ' + note.tags.map((t: string) => `#${t}`).join(' ')));
      }
      console.log(chalk.gray('   ' + new Date(note.createdAt).toLocaleDateString() + '\n'));
    });
  } catch {
    console.error(chalk.red('Search failed'));
    process.exit(1);
  }
}
