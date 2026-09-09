import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';
import { seedDemoUsers } from './scripts/seedUsers.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to database and ensure demo accounts exist in standalone mode
if (!process.env.VERCEL) {
  connectDB().then(async () => {
    await seedDemoUsers();
  }).catch((err) => {
    console.error('Initial DB connection error:', err.message);
  });

  // Start server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

export default app;
