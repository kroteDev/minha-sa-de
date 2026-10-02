declare module 'prisma/config' {
  export interface PrismaConfig {
    schema?: string;
    datasource?: {
      url?: string;
      shadowDatabaseUrl?: string;
    };
    migrations?: {
      directory?: string;
      seed?: string;
    };
    [key: string]: any;
  }

  export function defineConfig(config: PrismaConfig): PrismaConfig;
  export function env(variableName: string): string;
}
