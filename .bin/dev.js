const execa = require('execa');

process.env.COLOR = 'true';

const server = execa('hexo', ['server', '-p', '5000']);
const builder = execa('hexo', ['generate', '--watch']);
builder.stdout.pipe(process.stdout);

const stop = () => {
  server.kill();
  builder.kill();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
