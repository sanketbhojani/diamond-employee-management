const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';

mongoose.connect(MONGODB_URI)
.then(async () => {
  console.log('\n========================================');
  console.log('MongoDB Connected Successfully!');
  console.log('Exporting data to JSON...');
  console.log('========================================\n');

  const db = mongoose.connection.db;
  
  // Get all collections
  const collections = await db.listCollections().toArray();
  const exportData = {};
  
  for (const collection of collections) {
    const collectionName = collection.name;
    const documents = await db.collection(collectionName).find({}).toArray();
    exportData[collectionName] = documents;
    console.log(`✓ Exported ${documents.length} documents from ${collectionName}`);
  }

  // Create exports directory if it doesn't exist
  const exportDir = path.join(__dirname, 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  // Save to JSON file
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const filename = `mongodb-export-${timestamp}.json`;
  const filepath = path.join(exportDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');
  
  console.log('\n========================================');
  console.log(`✓ Data exported successfully!`);
  console.log(`  File: ${filepath}`);
  console.log(`  Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);
  console.log('========================================\n');

  // Also create a pretty HTML viewer
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MongoDB Data Viewer</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #007bff;
      padding-bottom: 10px;
    }
    .collection {
      margin: 30px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .collection-header {
      background: #007bff;
      color: white;
      padding: 15px 20px;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
    }
    .collection-header:hover {
      background: #0056b3;
    }
    .collection-content {
      padding: 20px;
      background: #f8f9fa;
      display: none;
    }
    .collection-content.active {
      display: block;
    }
    .doc-count {
      float: right;
      background: rgba(255,255,255,0.3);
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 14px;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    .empty {
      color: #999;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    .stats {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .stats p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 MongoDB Data Viewer</h1>
    <div class="stats">
      <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Total Collections:</strong> ${collections.length}</p>
      ${collections.map(c => `<p><strong>${c.name}:</strong> ${exportData[c.name]?.length || 0} documents</p>`).join('')}
    </div>
    
    ${collections.map((collection, index) => `
      <div class="collection">
        <div class="collection-header" onclick="toggleCollection(${index})">
          📁 ${collection.name}
          <span class="doc-count">${exportData[collection.name]?.length || 0} documents</span>
        </div>
        <div class="collection-content" id="collection-${index}">
          ${exportData[collection.name]?.length > 0 
            ? `<pre>${JSON.stringify(exportData[collection.name], null, 2)}</pre>` 
            : '<div class="empty">No documents found</div>'}
        </div>
      </div>
    `).join('')}
  </div>

  <script>
    function toggleCollection(index) {
      const content = document.getElementById('collection-' + index);
      content.classList.toggle('active');
    }
    
    // Open first collection by default
    if (document.getElementById('collection-0')) {
      document.getElementById('collection-0').classList.add('active');
    }
  </script>
</body>
</html>
  `;

  const htmlPath = path.join(exportDir, `mongodb-viewer-${timestamp}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  console.log(`✓ HTML viewer created!`);
  console.log(`  File: ${htmlPath}`);
  console.log(`\n  Open this HTML file in your browser to view data!\n`);

  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});






