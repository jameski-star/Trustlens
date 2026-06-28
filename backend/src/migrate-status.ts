import mongoose from 'mongoose';
import { config } from './config';
import { CommunityReport } from './models/CommunityReport';

async function migrate() {
  await mongoose.connect(config.mongodbUri);

  const result = await CommunityReport.updateMany(
    { status: { $in: ['approved', 'published'] } },
    { $set: { status: 'published' } },
  );

  console.log(`Fixed ${result.modifiedCount} report(s)`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
