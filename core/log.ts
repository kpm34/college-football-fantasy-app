export const log = {
  info: (msg: string, meta?: any) => console.log(`ℹ️ ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`⚠️ ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`❌ ${msg}`, meta || ''),
};

