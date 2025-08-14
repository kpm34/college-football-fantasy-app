#!/usr/bin/env node

const { Client, Storage, ID, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function setupStorageBuckets() {
  console.log('🗂️  Setting up Appwrite Storage Buckets...\n');

  const buckets = [
    {
      id: 'team-logos',
      name: 'Team Logos',
      permissions: [
        Permission.read(Role.any()), // Anyone can view logos
        Permission.create(Role.users()), // Any user can upload
        Permission.update(Role.users()), // Users can update their own
        Permission.delete(Role.users()), // Users can delete their own
      ],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      compression: 'gzip',
      antivirus: true,
      encryption: true,
    },
    {
      id: 'league-trophies',
      name: 'League Trophies & Badges',
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'],
      compression: 'gzip',
      antivirus: true,
      encryption: true,
    },
    {
      id: 'user-avatars',
      name: 'User Profile Pictures',
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      fileSizeLimit: 2 * 1024 * 1024, // 2MB
      allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      compression: 'gzip',
      antivirus: true,
      encryption: true,
    },
    {
      id: 'draft-exports',
      name: 'Draft Results & Reports',
      permissions: [
        Permission.read(Role.users()), // Only users can see
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      fileSizeLimit: 50 * 1024 * 1024, // 50MB for PDFs/CSVs
      allowedFileExtensions: ['pdf', 'csv', 'xlsx', 'json'],
      compression: 'none',
      antivirus: true,
      encryption: true,
    },
    {
      id: 'team-mascots',
      name: '3D Team Mascots',
      permissions: [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      fileSizeLimit: 25 * 1024 * 1024, // 25MB for 3D files
      allowedFileExtensions: ['glb', 'gltf', 'obj', 'fbx', 'png', 'jpg'],
      compression: 'none',
      antivirus: true,
      encryption: true,
    },
  ];

  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      await storage.createBucket(
        bucket.id,
        bucket.name,
        bucket.permissions,
        true, // enabled
        bucket.fileSizeLimit,
        bucket.allowedFileExtensions,
        bucket.compression,
        bucket.antivirus,
        bucket.encryption
      );
      
      console.log(`✅ Created bucket: ${bucket.id}`);
      console.log(`   - Size limit: ${(bucket.fileSizeLimit / 1024 / 1024).toFixed(0)}MB`);
      console.log(`   - File types: ${bucket.allowedFileExtensions.join(', ')}\n`);
      
    } catch (error) {
      if (error.code === 409) {
        console.log(`⚠️  Bucket "${bucket.id}" already exists\n`);
      } else {
        console.error(`❌ Error creating bucket ${bucket.id}:`, error.message, '\n');
      }
    }
  }

  console.log('📋 Storage Setup Summary:');
  console.log('- Team Logos: For fantasy team branding');
  console.log('- League Trophies: Custom awards and badges');
  console.log('- User Avatars: Profile pictures');
  console.log('- Draft Exports: PDF/CSV draft results');
  console.log('- Team Mascots: 3D mascot files from awwwards-rig\n');

  console.log('🎯 Next Steps:');
  console.log('1. Add TeamLogoUpload component to team settings');
  console.log('2. Implement avatar upload in user profile');
  console.log('3. Create draft export functionality');
  console.log('4. Integrate 3D mascot uploads\n');
}

// Run setup
setupStorageBuckets().catch(console.error);
