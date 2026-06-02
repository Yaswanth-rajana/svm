import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const API_URL = 'http://localhost:5001';

console.log('Connecting to MongoDB...');
async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const leadsCollection = db.collection('leads');

  const phone1 = '+919999911111';
  const phone2 = '+919999922222';

  // Cleanup past
  await leadsCollection.deleteMany({ phone: { $in: [phone1, phone2] } });
  console.log('Cleaned up previous test records.');

  console.log('\n--- 1. Submitting Homepage Lead ---');
  try {
    const res1 = await axios.post(`${API_URL}/api/leads`, {
      name: 'Test Infrastructure Lead',
      email: 'infra_test@example.com',
      phone: phone1,
      source: 'brochure',
      program: 'it-infrastructure'
    });
    console.log('Homepage API Response Status:', res1.status);
    console.log('Homepage API Response Data:', res1.data);
  } catch (err) {
    console.error('Homepage API Error:', err.response?.data || err.message);
  }

  console.log('\n--- 2. Submitting Cloud Computing Lead ---');
  try {
    const res2 = await axios.post(`${API_URL}/api/leads`, {
      name: 'Test Cloud Lead',
      email: 'cloud_test@example.com',
      phone: phone2,
      source: 'brochure',
      program: 'cloud-computing'
    });
    console.log('Cloud Computing API Response Status:', res2.status);
    console.log('Cloud Computing API Response Data:', res2.data);
  } catch (err) {
    console.error('Cloud Computing API Error:', err.response?.data || err.message);
  }

  console.log('\n--- 3. Database Verification ---');
  const lead1 = await leadsCollection.findOne({ phone: phone1 });
  console.log('Database entry for Homepage Lead:', lead1);

  const lead2 = await leadsCollection.findOne({ phone: phone2 });
  console.log('Database entry for Cloud Computing Lead:', lead2);

  if (lead1 && lead1.program === 'it-infrastructure') {
    console.log('✅ Test 1 Passed: Homepage lead correctly has program "it-infrastructure".');
  } else {
    console.error('❌ Test 1 Failed: Homepage lead does not have expected program.');
  }

  if (lead2 && lead2.program === 'cloud-computing') {
    console.log('✅ Test 2 Passed: Cloud computing lead correctly has program "cloud-computing".');
  } else {
    console.error('❌ Test 2 Failed: Cloud computing lead does not have expected program.');
  }

  // Clean up
  await leadsCollection.deleteMany({ phone: { $in: [phone1, phone2] } });
  console.log('Cleaned up test records.');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

run().catch(console.error);
