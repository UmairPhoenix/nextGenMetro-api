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
  try {
    console.log('🟡 Connecting to PostgreSQL...');
    await connectToDB();
    console.log('✅ Connected to PostgreSQL');

    const app = express();

    // Middleware to log every incoming request
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      console.log(`➡️  ${req.method} ${req.url}`);
      if (Object.keys(req.body).length) {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
      }
      next();
    });

    // Route registrations with debug logs
    console.log('🛠 Registering routes...');
    app.use('/auth', authRoutes);
    console.log('🔗 /auth routes loaded');

    app.use('/scan', scanRoutes);
    console.log('🔗 /scan routes loaded');

    app.use('/admin', adminRoutes);
    console.log('🔗 /admin routes loaded');

    app.use('/user', userRoutes);
    console.log('🔗 /user routes loaded');

    app.use('/jazzcash', jazzcashRoutes);
    console.log('🔗 /jazzcash routes loaded');

    // 404 handler
    app.use((req, res) => {
      console.warn(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ message: 'Route not found' });
    });

    // Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Unhandled Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${port}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
}

main();
