import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { syncOfficialJobs } from './services/jobSyncService.js';
import { seedAdminUser } from './services/adminSeedService.js';

dotenv.config();

const startServer = async () => {
  await connectDB();

  // Ensure Admin user is seeded and ready
  await seedAdminUser().catch((err) => {
    console.warn('Admin user seeding warning:', err.message);
  });

  // Populate verified real official jobs on startup
  syncOfficialJobs().catch((err) => {
    console.warn('Initial official job sync error:', err.message);
  });

  const defaultPort = Number(process.env.PORT || 5000);

  const tryListen = (port) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use. Retrying on ${port + 1}...`);
        tryListen(port + 1);
        return;
      }

      console.error('Server startup failed:', error.message);
      process.exit(1);
    });
  };

  tryListen(defaultPort);
};

startServer();
