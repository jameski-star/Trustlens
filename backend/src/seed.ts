import mongoose from 'mongoose';
import { config } from './config';
import { User } from './models/User';

async function makeAdmin(email: string) {
  await mongoose.connect(config.mongodbUri);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User with email "${email}" not found`);
    process.exit(1);
  }
  user.role = 'admin';
  await user.save();
  console.log(`User "${email}" is now an admin`);
  await mongoose.disconnect();
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx src/seed.ts <email>');
  process.exit(1);
}
makeAdmin(email).catch(console.error);
