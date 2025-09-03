#!/usr/bin/env node

// Add localhost platform using correct Appwrite Management API
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function addPlatform() {
  const { Client } = require('node-appwrite');
  
  // Use console project for management operations
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject('console') // Use console project for management
    .setKey(apiKey);

  try {
    console.log('🔧 Adding localhost platform...');
    
    // Direct API call to create platform
    const response = await fetch(`${endpoint}/projects/${projectId}/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'console', // Use console project
        'X-Appwrite-Key': apiKey,
        'X-Appwrite-Mode': 'admin'
      },
      body: JSON.stringify({
        type: 'web',
        name: 'localhost',
        hostname: 'localhost'
      })
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Successfully added localhost platform!');
      const data = JSON.parse(responseText);
      console.log('Platform ID:', data.$id);
      console.log('Hostname:', data.hostname);
    } else if (response.status === 409 || responseText.includes('already exists')) {
      console.log('✅ localhost platform already exists!');
    } else {
      console.log('Response status:', response.status);
      console.log('Response:', responseText);
      
      // Try listing platforms to see what exists
      console.log('\n📋 Checking existing platforms...');
      const listResponse = await fetch(`${endpoint}/projects/${projectId}/platforms`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': 'console',
          'X-Appwrite-Key': apiKey,
          'X-Appwrite-Mode': 'admin'
        }
      });
      
      if (listResponse.ok) {
        const platforms = await listResponse.json();
        console.log('Existing platforms:', JSON.stringify(platforms, null, 2));
        
        const hasLocalhost = platforms.platforms?.some(p => 
          p.hostname === 'localhost' || p.name === 'localhost'
        );
        
        if (hasLocalhost) {
          console.log('\n✅ Confirmed: localhost platform exists!');
        } else {
          console.log('\n⚠️  localhost not found in platforms list');
        }
      }
    }
    
    console.log('\n🎯 Now test OAuth at: http://localhost:8789');
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // Final fallback: check if we can at least read platforms
    try {
      const checkResponse = await fetch(`${endpoint}/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': 'console',
          'X-Appwrite-Key': apiKey,
          'X-Appwrite-Mode': 'admin'
        }
      });
      
      if (checkResponse.ok) {
        const project = await checkResponse.json();
        console.log('\n📊 Project details retrieved successfully');
        console.log('Project name:', project.name);
        console.log('Project ID:', project.$id);
        
        // Check platforms in project data
        if (project.platforms) {
          console.log('Platforms:', project.platforms);
        }
      }
    } catch (checkError) {
      console.log('Could not retrieve project details:', checkError.message);
    }
  }
}

addPlatform();
