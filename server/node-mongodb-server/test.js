const { MemoryCache } = require('memory-cache-node');

const memoryCache = new MemoryCache(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

console.log(memoryCache.hasItem('key1')); // Logs to console: true
console.log(memoryCache.hasItem('notFound')); // Logs to console: false
console.log(memoryCache.retrieveItemValue('key1')); // Logs to console: false