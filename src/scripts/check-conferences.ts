#!/usr/bin/env ts-node

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEW_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
    .setKey(process.env.NEW_APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

const databases = new Databases(client);

async function checkConferences() {
    try {
        const allPlayers = await databases.listDocuments(
            'college-football-fantasy',
            'college_players'
        );
        
        console.log(`🎉 Total Players in Database: ${allPlayers.total}`);
        
        // Get unique conference values
        const conferences = new Set();
        allPlayers.documents.forEach(p => {
            if (p.conference) {
                conferences.add(p.conference);
            }
        });
        
        console.log(`\n📊 Conferences found:`);
        conferences.forEach(conf => {
            const count = allPlayers.documents.filter(p => p.conference === conf).length;
            console.log(`${conf}: ${count} players`);
        });
        
        // Show some sample players
        console.log(`\n👥 Sample Players:`);
        allPlayers.documents.slice(0, 10).forEach(p => {
            console.log(`- ${p.name} (${p.position}) - ${p.team} - ${p.conference}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkConferences(); 