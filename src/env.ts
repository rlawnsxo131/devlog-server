import { config } from 'dotenv';
import path from 'path';

const { NODE_ENV } = process.env;

export default function initializeConfig() {
  config({
    path: path.resolve(
      process.cwd(),
      NODE_ENV === 'development' ? '.env.development' : '.env.production',
    ),
  });
}
