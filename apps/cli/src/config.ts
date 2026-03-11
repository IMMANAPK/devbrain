import Conf from 'conf';

interface DevBrainConfig {
  token: string;
  apiUrl: string;
  workspaceId: string;
}

export const config = new Conf<DevBrainConfig>({
  projectName: 'devbrain',
  defaults: {
    token: '',
    apiUrl: 'http://localhost:3001/api',
    workspaceId: '',
  },
});
