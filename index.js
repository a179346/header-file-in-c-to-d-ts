const parseFile = require('./parseFile');

parseFile('./headerFile/1.h', '  ');
parseFile('./headerFile/2.h', '  ');

// 使用方法:
// node index.js > 1.d.ts