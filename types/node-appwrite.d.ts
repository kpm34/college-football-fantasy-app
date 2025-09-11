declare module 'node-appwrite' {
  export namespace Models {
    export interface DocumentList<T = Document> {
      total: number;
      documents: T[];
    }
    
    export interface Document {
      $id: string;
      $collectionId: string;
      $databaseId: string;
      $createdAt: string;
      $updatedAt: string;
      $permissions: string[];
      [key: string]: any;
    }
    
    export interface User {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      name: string;
      email: string;
      phone: string;
      emailVerification: boolean;
      phoneVerification: boolean;
      status: boolean;
      labels: string[];
      prefs: Record<string, any>;
    }
    
    export interface Session {
      $id: string;
      $createdAt: string;
      userId: string;
      expire: string;
      provider: string;
      current: boolean;
    }
    
    export interface Team {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      name: string;
      total: number;
      prefs: Record<string, any>;
    }
    
    export interface Membership {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      userId: string;
      userName: string;
      userEmail: string;
      teamId: string;
      teamName: string;
      invited: string;
      joined: string;
      confirm: boolean;
      roles: string[];
    }
    
    export interface File {
      $id: string;
      bucketId: string;
      $createdAt: string;
      $updatedAt: string;
      $permissions: string[];
      name: string;
      signature: string;
      mimeType: string;
      sizeOriginal: number;
      chunksTotal: number;
      chunksUploaded: number;
    }
    
    export interface Execution {
      $id: string;
      $createdAt: string;
      $updatedAt: string;
      $permissions: string[];
      functionId: string;
      trigger: string;
      status: string;
      statusCode: number;
      response: string;
      stdout: string;
      stderr: string;
      duration: number;
    }
  }
  export class Client {
    setEndpoint(endpoint: string): Client;
    setProject(project: string): Client;
    setKey(key: string): Client;
    setJWT(jwt: string): Client;
    setLocale(locale: string): Client;
    setSession(session: string): Client;
  }

  export class Databases {
    constructor(client: Client);
    listDocuments(
      databaseId: string,
      collectionId: string,
      queries?: string[]
    ): Promise<{ documents: any[]; total: number }>;
    getDocument(
      databaseId: string,
      collectionId: string,
      documentId: string
    ): Promise<any>;
    createDocument(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: any,
      permissions?: string[]
    ): Promise<any>;
    updateDocument(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: any,
      permissions?: string[]
    ): Promise<any>;
    deleteDocument(
      databaseId: string,
      collectionId: string,
      documentId: string
    ): Promise<void>;
  }

  export class Users {
    constructor(client: Client);
    get(userId: string): Promise<any>;
    list(queries?: string[], search?: string): Promise<any>;
    create(
      userId: string,
      email?: string,
      phone?: string,
      password?: string,
      name?: string
    ): Promise<any>;
    updateName(userId: string, name: string): Promise<any>;
    updateEmail(userId: string, email: string): Promise<any>;
    updatePassword(userId: string, password: string): Promise<any>;
    updateLabels(userId: string, labels: string[]): Promise<any>;
    delete(userId: string): Promise<void>;
  }

  export class Storage {
    constructor(client: Client);
    getFile(bucketId: string, fileId: string): Promise<any>;
    getFileDownload(bucketId: string, fileId: string): Promise<any>;
    getFilePreview(
      bucketId: string,
      fileId: string,
      width?: number,
      height?: number
    ): Promise<any>;
    getFileView(bucketId: string, fileId: string): Promise<any>;
    createFile(
      bucketId: string,
      fileId: string,
      file: any,
      permissions?: string[]
    ): Promise<any>;
    updateFile(
      bucketId: string,
      fileId: string,
      permissions?: string[]
    ): Promise<any>;
    deleteFile(bucketId: string, fileId: string): Promise<void>;
  }

  export class Functions {
    constructor(client: Client);
    createExecution(
      functionId: string,
      body?: string,
      async?: boolean,
      path?: string,
      method?: string,
      headers?: Record<string, string>
    ): Promise<any>;
    getExecution(functionId: string, executionId: string): Promise<any>;
    listExecutions(functionId: string, queries?: string[]): Promise<any>;
  }

  export class Messaging {
    constructor(client: Client);
    createEmail(
      messageId: string,
      subject: string,
      content: string,
      topics?: string[],
      users?: string[],
      targets?: string[],
      attachments?: string[],
      draft?: boolean,
      html?: boolean,
      scheduledAt?: string
    ): Promise<any>;
  }

  export class Teams {
    constructor(client: Client);
    list(queries?: string[], search?: string): Promise<any>;
    create(teamId: string, name: string, roles?: string[]): Promise<any>;
    get(teamId: string): Promise<any>;
    updateName(teamId: string, name: string): Promise<any>;
    delete(teamId: string): Promise<void>;
    listMemberships(teamId: string, queries?: string[], search?: string): Promise<any>;
    createMembership(
      teamId: string,
      email?: string,
      userId?: string,
      phone?: string,
      roles?: string[],
      url?: string
    ): Promise<any>;
    getMembership(teamId: string, membershipId: string): Promise<any>;
    updateMembership(teamId: string, membershipId: string, roles: string[]): Promise<any>;
    updateMembershipStatus(
      teamId: string,
      membershipId: string,
      userId: string,
      secret: string
    ): Promise<any>;
    deleteMembership(teamId: string, membershipId: string): Promise<void>;
  }

  export class Account {
    constructor(client: Client);
    get(): Promise<any>;
    updateEmail(email: string, password: string): Promise<any>;
    updateName(name: string): Promise<any>;
    updatePassword(password: string, oldPassword: string): Promise<any>;
    updatePhone(phone: string, password: string): Promise<any>;
    updatePrefs(prefs: Record<string, any>): Promise<any>;
    createEmailSession(email: string, password: string): Promise<any>;
    deleteSession(sessionId: string): Promise<any>;
    deleteSessions(): Promise<void>;
  }

  export class Query {
    static equal(attribute: string, value: any): string;
    static notEqual(attribute: string, value: any): string;
    static lessThan(attribute: string, value: any): string;
    static lessThanEqual(attribute: string, value: any): string;
    static greaterThan(attribute: string, value: any): string;
    static greaterThanEqual(attribute: string, value: any): string;
    static isNull(attribute: string): string;
    static isNotNull(attribute: string): string;
    static between(attribute: string, min: any, max: any): string;
    static startsWith(attribute: string, value: string): string;
    static endsWith(attribute: string, value: string): string;
    static select(attributes: string[]): string;
    static search(attribute: string, value: string): string;
    static orderDesc(attribute: string): string;
    static orderAsc(attribute: string): string;
    static limit(value: number): string;
    static offset(value: number): string;
    static cursorAfter(documentId: string): string;
    static cursorBefore(documentId: string): string;
    static contains(attribute: string, value: any): string;
    static or(queries: string[]): string;
    static and(queries: string[]): string;
  }

  export class ID {
    static unique(): string;
    static custom(id: string): string;
  }

  export class Permission {
    static read(role: string): string;
    static write(role: string): string;
    static create(role: string): string;
    static update(role: string): string;
    static delete(role: string): string;
  }

  export class Role {
    static any(): string;
    static user(id: string, status?: string): string;
    static users(status?: string): string;
    static guests(): string;
    static team(id: string, role?: string): string;
    static member(id: string): string;
    static label(name: string): string;
  }

  export enum ExecutionMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD',
  }

  export class AppwriteException extends Error {
    code: number;
    response: string;
    type: string;
    constructor(message: string, code?: number, type?: string, response?: string);
  }
}