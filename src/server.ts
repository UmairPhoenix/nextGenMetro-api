import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { connectToDB } from './db';
import authRoutes from './routes/auth';
import scanRoutes from './routes/scan';
import adminRoutes from './routes/admin';

async function main() {
  await connectToDB();
  const app = express();
  app.use(bodyParser.json());

  app.use('/auth', authRoutes);
  app.use('/scan', scanRoutes);
  app.use('/admin', adminRoutes);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(3000, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:3000`);
});

}

main().catch(err => {
  console.error('Failed to start server:', err);
});
