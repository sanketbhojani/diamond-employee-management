const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('\n========================================');
  console.log('MongoDB Connected Successfully!');
  console.log('========================================\n');

  const db = mongoose.connection.db;
  
  // Get all collections
  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections:\n`);

  for (const collection of collections) {
    const collectionName = collection.name;
    const count = await db.collection(collectionName).countDocuments();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📁 Collection: ${collectionName} (${count} documents)`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (count === 0) {
      console.log('  (No documents found)\n');
      continue;
    }

    const documents = await db.collection(collectionName).find({}).toArray();
    
    documents.forEach((doc, index) => {
      console.log(`  Document ${index + 1}:`);
      console.log(JSON.stringify(doc, null, 2));
      console.log('\n');
    });

    // Summary for large collections
    if (count > 10) {
      console.log(`  ... (showing all ${count} documents)\n`);
    }
  }

  // Show statistics
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Database Statistics');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  for (const collection of collections) {
    const collectionName = collection.name;
    const count = await db.collection(collectionName).countDocuments();
    console.log(`  ${collectionName}: ${count} documents`);
  }

  console.log('\n========================================');
  console.log('Data View Complete!');
  console.log('========================================\n');

  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});






