# MCP Quick Reference

## 🚨 Common Issues & Fixes

### 1. MCP Server Not Starting
- **Issue**: Servers show as "disconnected" or "failed"
- **Fix**: Check JSON syntax - no trailing commas, proper quotes

### 2. Appwrite Connection Failed
- **Issue**: Can't connect to database
- **Fix**: Remove any `< >` brackets from API keys and IDs

### 3. Command Format Issues
- **Issue**: Server fails with "command not found"
- **Fix**: Use separate `command` and `args` fields:
  ```json
  "command": "uvx",
  "args": ["mcp-server-appwrite", "--users"]
  ```
  NOT: `"command": "uvx mcp-server-appwrite --users"`

## ✅ Working Configuration Structure

```json
{
  "mcpServers": {
    "serverName": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "KEY": "value"
      }
    }
  }
}
```

## 🔄 After Any Changes
1. Save the file
2. Restart Cursor completely
3. Check status bar for MCP server status

## 📍 File Location
- macOS/Linux: `~/.cursor/mcp.json`
- Windows: `%USERPROFILE%\.cursor\mcp.json`

