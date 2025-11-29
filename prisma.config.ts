// prisma.config.ts
import 'dotenv/config'

export default {
  schema: './prisma/schema.prisma',
  connection: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: './prisma/migrations',
  },
  seed: {
    path: './prisma/seed.ts',
  },
}