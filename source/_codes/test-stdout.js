const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const script = process.argv[2] && path.resolve(process.argv[2]);

const total = 100;

if (fs.existsSync(script)) {
  const map = {};

  for (let i = 0; i < total; i++) {
    const res = cp.spawnSync('node', [script]).stdout;
    map[res] = (map[res] || 0) + 1;
    console.log(`${i + 1}/${total}`);
  }

  for (const [key, value] of Object.entries(map)) {
    console.log('------------------');
    console.log(key);
    console.log('---- Times:', value);
    console.log('------------------');
  }
}
