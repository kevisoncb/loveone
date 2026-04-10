import { defineConfig } from "drizzle-kit";
import { URL } from 'url';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Analisa a URL para extrair as credenciais e o host
const dbUrl = new URL(connectionString);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Remove a barra inicial do caminho
    ssl: {
      // Força a criptografia da conexão para o TiDB Cloud
      rejectUnauthorized: true,
    },
  },
});
