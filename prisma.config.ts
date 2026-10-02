import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega .env local, ou .env.local / .env.production caso .env padrão ainda não tenha sido copiado
const rootDir = process.cwd();
if (fs.existsSync(path.resolve(rootDir, '.env'))) {
  dotenv.config({ path: path.resolve(rootDir, '.env') });
} else if (fs.existsSync(path.resolve(rootDir, '.env.local'))) {
  dotenv.config({ path: path.resolve(rootDir, '.env.local') });
} else if (fs.existsSync(path.resolve(rootDir, '.env.production'))) {
  dotenv.config({ path: path.resolve(rootDir, '.env.production') });
} else {
  dotenv.config();
}

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || env('DATABASE_URL'),
  },
  migrations: {
    directory: 'prisma/migrations',
  },
});
