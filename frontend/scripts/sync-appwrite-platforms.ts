#!/usr/bin/env ts-node

/*
  Sync Appwrite Web Platform origins and OAuth redirect URLs across all production domains.
  Usage:
    APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... ts-node frontend/scripts/sync-appwrite-platforms.ts
*/

import { Client, Projects } from 'node-appwrite';

const REQUIRED_ORIGINS = [
  'https://cfbfantasy.app',
  'https://www.cfbfantasy.app',
  'https://collegefootballfantasy.app',
  'https://www.collegefootballfantasy.app',
];

const REQUIRED_REDIRECTS = [
  '/',
  '/login',
].flatMap((path) => [
  `https://cfbfantasy.app${path}`,
  `https://www.cfbfantasy.app${path}`,
  `https://collegefootballfantasy.app${path}`,
  `https://www.collegefootballfantasy.app${path}`,
]);

async function main(): Promise<void> {
  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is required');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const projects = new Projects(client);

  // Fetch existing platforms
  const platformsList = await projects.listPlatforms(projectId);
  const webPlatforms = platformsList.platforms.filter((p: any) => p.type === 'web');

  // Ensure a single consolidated web platform exists; create if missing
  let webPlatform = webPlatforms[0];
  if (!webPlatform) {
    webPlatform = await projects.createPlatformWeb(projectId, 'web', REQUIRED_ORIGINS[0]);
  }

  // Merge origins
  const currentOrigins = new Set<string>(webPlatform.domains || []);
  let updated = false;
  for (const origin of REQUIRED_ORIGINS) {
    if (!currentOrigins.has(origin)) {
      currentOrigins.add(origin);
      updated = true;
    }
  }

  // Merge redirect URLs
  const currentRedirects = new Set<string>(webPlatform.redirectUris || []);
  for (const url of REQUIRED_REDIRECTS) {
    if (!currentRedirects.has(url)) {
      currentRedirects.add(url);
      updated = true;
    }
  }

  if (updated) {
    await projects.updatePlatform(projectId, webPlatform.$id, {
      domains: Array.from(currentOrigins),
      redirectUris: Array.from(currentRedirects),
    } as any);
    // eslint-disable-next-line no-console
    console.log('Updated Appwrite web platform with domains and redirect URIs');
  } else {
    // eslint-disable-next-line no-console
    console.log('Appwrite web platform already up to date');
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



