/**
 * MCP Tools Client - Direct access to MCP server capabilities
 * Provides programmatic access to MCP servers configured in ~/.cursor/mcp.json
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPServersConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export class MCPToolsClient {
  private config: MCPServersConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.cursor', 'mcp.json');
  }

  /**
   * Load MCP configuration from ~/.cursor/mcp.json
   */
  async loadConfig(): Promise<MCPServersConfig> {
    if (this.config) return this.config;
    
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configData);
      return this.config!;
    } catch (error) {
      throw new Error(`Failed to load MCP config from ${this.configPath}: ${error}`);
    }
  }

  /**
   * Get available MCP servers
   */
  async getAvailableServers(): Promise<string[]> {
    const config = await this.loadConfig();
    return Object.keys(config.mcpServers);
  }

  /**
   * Execute MCP command via server
   */
  async executeMCPCommand(
    serverName: string, 
    method: string, 
    params: any = {}
  ): Promise<any> {
    const config = await this.loadConfig();
    const serverConfig = config.mcpServers[serverName];
    
    if (!serverConfig) {
      throw new Error(`MCP server '${serverName}' not found in configuration`);
    }

    return new Promise((resolve, reject) => {
      const process = spawn(serverConfig.command, serverConfig.args, {
        env: { ...process.env, ...serverConfig.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(stdout));
          } catch (error) {
            resolve(stdout);
          }
        } else {
          reject(new Error(`MCP command failed with code ${code}: ${stderr}`));
        }
      });

      // Send JSON-RPC request
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
      };

      process.stdin.write(JSON.stringify(request) + '\n');
      process.stdin.end();
    });
  }

  /**
   * Appwrite-specific methods
   */
  async listAppwriteCollections(): Promise<any> {
    return this.executeMCPCommand('appwrite', 'list_collections', {});
  }

  async listAppwriteDocuments(collectionId: string, limit = 25): Promise<any> {
    return this.executeMCPCommand('appwrite', 'list_documents', {
      collection_id: collectionId,
      limit
    });
  }

  async getAppwriteDocument(collectionId: string, documentId: string): Promise<any> {
    return this.executeMCPCommand('appwrite', 'get_document', {
      collection_id: collectionId,
      document_id: documentId
    });
  }

  async createAppwriteDocument(collectionId: string, data: any): Promise<any> {
    return this.executeMCPCommand('appwrite', 'create_document', {
      collection_id: collectionId,
      data
    });
  }

  async updateAppwriteDocument(
    collectionId: string, 
    documentId: string, 
    data: any
  ): Promise<any> {
    return this.executeMCPCommand('appwrite', 'update_document', {
      collection_id: collectionId,
      document_id: documentId,
      data
    });
  }

  async deleteAppwriteDocument(collectionId: string, documentId: string): Promise<any> {
    return this.executeMCPCommand('appwrite', 'delete_document', {
      collection_id: collectionId,
      document_id: documentId
    });
  }

  /**
   * GitHub-specific methods
   */
  async listGitHubRepositories(owner: string): Promise<any> {
    return this.executeMCPCommand('githubLocal', 'list_repositories', { owner });
  }

  async getGitHubRepository(owner: string, repo: string): Promise<any> {
    return this.executeMCPCommand('githubLocal', 'get_repository', { owner, repo });
  }

  async listGitHubIssues(owner: string, repo: string): Promise<any> {
    return this.executeMCPCommand('githubLocal', 'list_issues', { owner, repo });
  }

  async createGitHubIssue(
    owner: string, 
    repo: string, 
    title: string, 
    body: string
  ): Promise<any> {
    return this.executeMCPCommand('githubLocal', 'create_issue', {
      owner,
      repo,
      title,
      body
    });
  }

  /**
   * Memory-specific methods
   */
  async storeMemory(key: string, value: any): Promise<any> {
    return this.executeMCPCommand('memory', 'store', { key, value });
  }

  async retrieveMemory(key: string): Promise<any> {
    return this.executeMCPCommand('memory', 'retrieve', { key });
  }

  async listMemoryKeys(): Promise<any> {
    return this.executeMCPCommand('memory', 'list_keys', {});
  }

  /**
   * Filesystem-specific methods
   */
  async readFile(filePath: string): Promise<any> {
    return this.executeMCPCommand('filesystem', 'read_file', { path: filePath });
  }

  async writeFile(filePath: string, content: string): Promise<any> {
    return this.executeMCPCommand('filesystem', 'write_file', { 
      path: filePath, 
      content 
    });
  }

  async listDirectory(directoryPath: string): Promise<any> {
    return this.executeMCPCommand('filesystem', 'list_directory', { 
      path: directoryPath 
    });
  }

  /**
   * Shell-specific methods (for media processing)
   */
  async executeFFmpegCommand(command: string[]): Promise<any> {
    return this.executeMCPCommand('shell', 'execute', {
      command: 'ffmpeg',
      args: command
    });
  }

  async executeSoXCommand(command: string[]): Promise<any> {
    return this.executeMCPCommand('shell', 'execute', {
      command: 'sox',
      args: command
    });
  }

  async executeBlenderCommand(command: string[]): Promise<any> {
    return this.executeMCPCommand('shell', 'execute', {
      command: 'blender',
      args: command
    });
  }
}

export const mcpTools = new MCPToolsClient();