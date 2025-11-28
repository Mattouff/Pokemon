import dotenv from 'dotenv';
import App from './app';
import db from './config/database';

dotenv.config();

const app = new App();

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, closing gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, closing gracefully...');
  await db.close();
  process.exit(0);
});

app.listen();
