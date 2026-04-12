import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');

console.log(`🔄 Loading environment variables from: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error(' FATAL: Could not load .env file.', result.error);
}

console.log('✅ Environment variables loaded (or attempted).');
console.log('🔍 GEMINI_API_KEY status:', process.env.GEMINI_API_KEY ? 'Loaded' : 'MISSING');