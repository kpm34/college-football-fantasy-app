# MCP (Model Context Protocol) Setup Guide for Cursor

## ✅ Current Configuration

I've updated your `~/.cursor/mcp.json` with a working configuration that includes:

1. **GitHub** - For GitHub Copilot integration
2. **Appwrite** - For database operations with your credentials
3. **Filesystem** - For file system access in your project
4. **Memory** - For persistent memory across conversations

## 📋 Copy-Paste Configuration

If you need to recreate or modify your MCP settings, here's the complete configuration:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "appwrite": {
      "command": "uvx",
      "args": [
        "mcp-server-appwrite",
        "--users"
      ],
      "env": {
        "APPWRITE_API_KEY": "standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891",
        "APPWRITE_PROJECT_ID": "college-football-fantasy-app",
        "APPWRITE_ENDPOINT": "https://nyc.cloud.appwrite.io/v1"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/kashyapmaheshwari/college-football-fantasy-app"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

## 🔧 Optional Additional MCP Servers

You can add these servers if needed:

### 1. PostgreSQL (if you use it)
```json
"postgres": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-postgres",
    "postgresql://localhost/college_football_fantasy"
  ]
}
```

### 2. Brave Search (for web searches)
```json
"brave-search": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-brave-search"
  ],
  "env": {
    "BRAVE_API_KEY": "your-brave-api-key-here"
  }
}
```

### 3. Puppeteer (for web scraping)
```json
"puppeteer": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-puppeteer"
  ]
}
```

### 4. Anthropic (for Claude API)
```json
"anthropic": {
  "command": "npx",
  "args": [
    "-y",
    "@anthropic/mcp-server-anthropic"
  ],
  "env": {
    "ANTHROPIC_API_KEY": "your-anthropic-api-key"
  }
}
```

## 🚀 How to Apply Changes

1. **Restart Cursor** after modifying `~/.cursor/mcp.json`
2. **Verify MCP is working** by checking the Cursor status bar
3. **Test Appwrite connection** by asking about your database

## 📝 What Each Server Does

- **GitHub**: Enables GitHub Copilot features
- **Appwrite**: Direct database access for your College Football Fantasy App
- **Filesystem**: Allows reading/writing files in your project
- **Memory**: Persists information across conversations

## 🔍 Troubleshooting

If MCP servers fail to start:

1. **Check JSON syntax** - Make sure there are no trailing commas
2. **Verify paths** - Ensure the filesystem path exists
3. **Check API keys** - Confirm your Appwrite credentials are correct
4. **Install dependencies**:
   ```bash
   npm install -g uvx
   npm install -g npx
   ```

## 🔒 Security Note

Your MCP configuration contains sensitive API keys. Make sure:
- Never commit `~/.cursor/mcp.json` to git
- Keep your API keys secure
- Rotate keys periodically

## 💡 Pro Tips

1. **Use filesystem server** to let AI read/write files directly
2. **Memory server** helps maintain context across sessions
3. **Appwrite server** enables direct database queries
4. **Add servers as needed** - don't overload with unused servers

Your MCP configuration is now set up and ready to use! 🎉
