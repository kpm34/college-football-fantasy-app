# External API Routes

## Overview
This diagram shows the external service integration API routes.

## Data Source Integrations

### 1. CFBD Players API
- **Route**: `/api/(external)/cfbd/players`
- **Method**: GET
- **Purpose**: Sync player data from College Football Data API
- **Authentication**: CFBD API key
- **Data Flow**: CFBD API → Data processing → college_players collection
- **Filters**: Fantasy-relevant positions only (QB, RB, WR, TE, K)
- **Update Frequency**: Daily

## AI Service Integrations

### 2. Claude API
- **Route**: `/api/(external)/claude`
- **Method**: POST/GET
- **Purpose**: AI-powered draft analysis and recommendations
- **Authentication**: Anthropic API key
- **Usage**: Draft strategy analysis, player recommendations
- **Input**: Prompt, model, maxTokens, temperature
- **Output**: AI-generated text responses

### 3. Runway Video API
- **Route**: `/api/(external)/runway/create`
- **Method**: POST
- **Purpose**: Create AI-generated video content
- **Authentication**: Runway API key
- **Usage**: Draft highlight videos, team introductions
- **Storage**: runway_jobs collection
- **Output**: Video generation job ID

### 4. Meshy 3D API
- **Route**: `/api/(external)/meshy/jobs`
- **Method**: POST/PATCH
- **Purpose**: Generate 3D models and assets
- **Authentication**: Meshy API key
- **Usage**: Team mascots, 3D visualizations
- **Storage**: meshy_jobs collection

## Webhook Endpoints

### 5. Runway Webhook
- **Route**: `/api/(external)/runway/webhook`
- **Method**: POST
- **Purpose**: Receive video generation completion notifications
- **Authentication**: Webhook secret validation
- **Updates**: runway_jobs collection with results

### 6. Meshy Webhook
- **Route**: `/api/(external)/meshy/webhook`
- **Method**: POST
- **Purpose**: Receive 3D model generation notifications
- **Authentication**: Webhook secret validation
- **Updates**: meshy_jobs collection with results

