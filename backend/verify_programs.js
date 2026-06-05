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

  const phoneServer = '+919999900001';
  const phoneStorage = '+919999900002';
  const phoneBackup = '+919999900003';

  // Cleanup past test data
  await leadsCollection.deleteMany({ phone: { $in: [phoneServer, phoneStorage, phoneBackup] } });
  console.log('Cleaned up previous test records.');

  console.log('\n--- 1. Submitting Server Engineering Lead ---');
  try {
    const res = await axios.post(`${API_URL}/api/leads`, {
      name: 'Test Server Lead',
      email: 'server_test@example.com',
      phone: phoneServer,
      source: 'brochure',
      program: 'server-engineering'
    });
    console.log('Server Engineering API Response Status:', res.status);
    console.log('Server Engineering API Response Data:', res.data);
  } catch (err) {
    console.error('Server Engineering API Error:', err.response?.data || err.message);
  }

  console.log('\n--- 2. Submitting Storage Engineering Lead ---');
  try {
    const res = await axios.post(`${API_URL}/api/leads`, {
      name: 'Test Storage Lead',
      email: 'storage_test@example.com',
      phone: phoneStorage,
      source: 'brochure',
      program: 'storage-engineering'
    });
    console.log('Storage Engineering API Response Status:', res.status);
    console.log('Storage Engineering API Response Data:', res.data);
  } catch (err) {
    console.error('Storage Engineering API Error:', err.response?.data || err.message);
  }

  console.log('\n--- 3. Submitting Backup Engineering Lead ---');
  try {
    const res = await axios.post(`${API_URL}/api/leads`, {
      name: 'Test Backup Lead',
      email: 'backup_test@example.com',
      phone: phoneBackup,
      source: 'brochure',
      program: 'backup-engineering'
    });
    console.log('Backup Engineering API Response Status:', res.status);
    console.log('Backup Engineering API Response Data:', res.data);
  } catch (err) {
    console.error('Backup Engineering API Error:', err.response?.data || err.message);
  }

  console.log('\n--- 4. Database Verification ---');
  const leadServer = await leadsCollection.findOne({ phone: phoneServer });
  console.log('Database entry for Server Lead:', leadServer);

  const leadStorage = await leadsCollection.findOne({ phone: phoneStorage });
  console.log('Database entry for Storage Lead:', leadStorage);

  const leadBackup = await leadsCollection.findOne({ phone: phoneBackup });
  console.log('Database entry for Backup Lead:', leadBackup);

  let allPassed = true;

  if (leadServer && leadServer.program === 'server-engineering') {
    console.log('✅ Test Server Passed: Program is "server-engineering".');
  } else {
    console.error('❌ Test Server Failed: Program is not "server-engineering".');
    allPassed = false;
  }

  if (leadStorage && leadStorage.program === 'storage-engineering') {
    console.log('✅ Test Storage Passed: Program is "storage-engineering".');
  } else {
    console.error('❌ Test Storage Failed: Program is not "storage-engineering".');
    allPassed = false;
  }

  if (leadBackup && leadBackup.program === 'backup-engineering') {
    console.log('✅ Test Backup Passed: Program is "backup-engineering".');
  } else {
    console.error('❌ Test Backup Failed: Program is not "backup-engineering".');
    allPassed = false;
  }

  if (allPassed) {
    console.log('\n🎉 ALL DATABASE LEAD REGISTRATION TESTS PASSED successfully!');
  } else {
    console.error('\n❌ SOME DATABASE LEAD REGISTRATION TESTS FAILED!');
  }

  // Clean up
  await leadsCollection.deleteMany({ phone: { $in: [phoneServer, phoneStorage, phoneBackup] } });
  console.log('Cleaned up test records.');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

run().catch(console.error);
