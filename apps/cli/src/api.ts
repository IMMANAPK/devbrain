import axios from 'axios';
import { config } from './config.js';

export function getClient() {
  return axios.create({
    baseURL: config.get('apiUrl'),
    headers: { Authorization: `Bearer ${config.get('token')}` },
  });
}
