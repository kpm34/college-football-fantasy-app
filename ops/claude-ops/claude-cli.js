#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\n🤖 Claude> ',
});

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════╗
║     Claude CLI - AI Development Tool     ║
╚══════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.yellow}Commands:${colors.reset}
  ${colors.green}/help${colors.reset}     - Show available commands
  ${colors.green}/code${colors.reset}     - Generate code from description
  ${colors.green}/review${colors.reset}   - Review code from file
  ${colors.green}/explain${colors.reset}  - Explain code from file
  ${colors.green}/test${colors.reset}     - Generate tests for code
  ${colors.green}/docs${colors.reset}     - Generate documentation
  ${colors.green}/model${colors.reset}    - Switch Claude model
  ${colors.green}/clear${colors.reset}    - Clear conversation
  ${colors.green}/exit${colors.reset}     - Exit CLI
`);

let currentModel = 'claude-3-5-sonnet-20241022';
let conversationHistory = [];

async function sendMessage(prompt, systemPrompt = 'You are a helpful AI coding assistant.') {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await anthropic.messages.create({
      model: currentModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0].text;
    
    // Update conversation history
    conversationHistory.push({ role: 'user', content: prompt });
    conversationHistory.push({ role: 'assistant', content: assistantMessage });
    
    // Keep only last 10 exchanges
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    return assistantMessage;
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return null;
  }
}

async function handleCommand(input) {
  const [command, ...args] = input.trim().split(' ');
  
  switch (command) {
    case '/help':
      console.log(`${colors.cyan}Available commands:${colors.reset}
  ${colors.green}/code <description>${colors.reset} - Generate code
  ${colors.green}/review <file>${colors.reset} - Review code file
  ${colors.green}/explain <file>${colors.reset} - Explain code file
  ${colors.green}/test <file>${colors.reset} - Generate tests
  ${colors.green}/docs <file>${colors.reset} - Generate documentation
  ${colors.green}/model [opus|sonnet|haiku]${colors.reset} - Switch model
  ${colors.green}/clear${colors.reset} - Clear conversation
  ${colors.green}/exit${colors.reset} - Exit CLI`);
      break;

    case '/code':
      if (args.length === 0) {
        console.log('Usage: /code <description>');
        break;
      }
      console.log(`${colors.blue}Generating code...${colors.reset}`);
      const codeResponse = await sendMessage(
        args.join(' '),
        'You are an expert developer. Generate clean, efficient code based on the description. Include comments.'
      );
      if (codeResponse) {
        console.log(`\n${colors.green}${codeResponse}${colors.reset}`);
      }
      break;

    case '/review':
    case '/explain':
    case '/test':
    case '/docs':
      if (args.length === 0) {
        console.log(`Usage: ${command} <file>`);
        break;
      }
      const filePath = path.resolve(args[0]);
      if (!fs.existsSync(filePath)) {
        console.log(`${colors.red}File not found: ${filePath}${colors.reset}`);
        break;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const prompts = {
        '/review': `Review this code for bugs, improvements, and best practices:\n\n${fileContent}`,
        '/explain': `Explain what this code does in detail:\n\n${fileContent}`,
        '/test': `Generate comprehensive tests for this code:\n\n${fileContent}`,
        '/docs': `Generate detailed documentation for this code:\n\n${fileContent}`,
      };
      
      console.log(`${colors.blue}Processing ${filePath}...${colors.reset}`);
      const fileResponse = await sendMessage(prompts[command]);
      if (fileResponse) {
        console.log(`\n${colors.green}${fileResponse}${colors.reset}`);
      }
      break;

    case '/model':
      const models = {
        'opus': 'claude-3-opus-20240229',
        'sonnet': 'claude-3-5-sonnet-20241022',
        'haiku': 'claude-3-haiku-20240307',
      };
      
      if (args.length === 0 || !models[args[0]]) {
        console.log(`Current model: ${colors.cyan}${currentModel}${colors.reset}`);
        console.log('Available models: opus, sonnet, haiku');
      } else {
        currentModel = models[args[0]];
        console.log(`${colors.green}Switched to ${currentModel}${colors.reset}`);
      }
      break;

    case '/clear':
      conversationHistory = [];
      console.clear();
      console.log(`${colors.green}Conversation cleared!${colors.reset}`);
      break;

    case '/exit':
      console.log(`${colors.cyan}Goodbye!${colors.reset}`);
      process.exit(0);
      break;

    default:
      // Regular conversation
      console.log(`${colors.blue}Thinking...${colors.reset}`);
      const response = await sendMessage(input);
      if (response) {
        console.log(`\n${colors.magenta}Claude:${colors.reset} ${response}`);
      }
  }
}

rl.prompt();

rl.on('line', async (line) => {
  await handleCommand(line);
  rl.prompt();
}).on('close', () => {
  console.log(`\n${colors.cyan}Goodbye!${colors.reset}`);
  process.exit(0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(`\n${colors.cyan}Goodbye!${colors.reset}`);
  process.exit(0);
});