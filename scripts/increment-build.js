const fs = require('fs');
const path = require('path');

const versionFilePath = path.join(__dirname, '..', 'version.json');

try {
  const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
  versionData.build += 1;
  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
  console.log(`Build number incremented to ${versionData.build}`);
} catch (error) {
  console.error('Failed to increment build number:', error);
  process.exit(1);
}
