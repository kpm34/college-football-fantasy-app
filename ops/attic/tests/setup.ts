/**
 * Jest test setup
 * Configures test environment for schema contract tests
 */

// Increase timeout for Appwrite API calls
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Only show important messages during tests
  console.log = (...args: any[]) => {
    if (args[0]?.includes('✅') || args[0]?.includes('❌')) {
      originalConsoleLog(...args);
    }
  };
  
  console.warn = (...args: any[]) => {
    if (args[0]?.includes('⚠️')) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});