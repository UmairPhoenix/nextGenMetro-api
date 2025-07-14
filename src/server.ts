import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { connectToDB } from './db';
import authRoutes from './routes/auth.route';
import scanRoutes from './routes/scan.route';
import adminRoutes from './routes/admin.route';
import userRoutes from './routes/user.route';
import jazzcashRoutes from './routes/jazzcash.route';

async function main() {
  await connectToDB();
  const app = express();
  app.use(bodyParser.json());

  app.use('/auth', authRoutes);
  app.use('/scan', scanRoutes);
  app.use('/admin', adminRoutes);
  app.use('/user', userRoutes);
  app.use('/jazzcash', jazzcashRoutes);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(3000, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:3000`);
});

}

main().catch(err => {
  console.error('Failed to start server:', err);
});
