const fs = require('fs');
const path = require('path');

const type = process.argv[2] || 'build'; // 'build' or 'commit'
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionJsonPath = path.join(__dirname, '..', 'version.json');

try {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let [major, minor, patch] = pkg.version.split('.').map(Number);

  if (type === 'commit') {
    minor += 1;
    patch = 0; // Reset patch on minor bump
  } else if (type === 'build') {
    patch += 1;
  }

  const newVersion = `${major}.${minor}.${patch}`;
  pkg.version = newVersion;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  fs.writeFileSync(versionJsonPath, JSON.stringify({ version: newVersion }, null, 2) + '\n');
  
  console.log(`Version bumped to ${newVersion} (${type})`);
} catch (error) {
  console.error(`Failed to bump version:`, error);
  process.exit(1);
}
