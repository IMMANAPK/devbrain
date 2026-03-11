import axios from 'axios';
import chalk from 'chalk';
import { config } from '../config.js';

export async function loginCommand(email: string, password: string) {
  try {
    const apiUrl = config.get('apiUrl');
    const { data } = await axios.post(`${apiUrl}/auth/login`, { email, password });
    config.set('token', data.accessToken);
    console.log(chalk.green(`✓ Logged in as ${data.user.name}`));
  } catch {
    console.error(chalk.red('✗ Login failed. Check your credentials.'));
    process.exit(1);
  }
}
