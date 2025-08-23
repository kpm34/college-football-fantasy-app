import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases, serverStorage as storage } from '@lib/appwrite-server'
import { DATABASE_ID, COLLECTIONS } from '@lib/appwrite'
import { ID } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ID = 'mascot_templates'

// GET: Fetch all mascot templates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check if collection exists, if not return default templates
    let templates = []
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        []
      )
      templates = result.documents
    } catch (error) {
      console.log('Mascot templates collection not found, returning defaults')
      // Return default templates for college football
      templates = getDefaultTemplates()
    }

    // Filter by category if specified
    const filteredTemplates = category === 'all' 
      ? templates 
      : templates.filter((template: any) => template.category === category)

    return NextResponse.json({
      templates: filteredTemplates.slice(0, limit),
      total: filteredTemplates.length,
      categories: ['football', 'helmet', 'mascot', 'logo']
    })
  } catch (error: any) {
    console.error('Error fetching mascot templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST: Create a new mascot template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, category, modelUrl, thumbnailUrl, presets, userId } = body

    if (!name || !category || !modelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, modelUrl' },
        { status: 400 }
      )
    }

    // Create template document
    const template = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        name,
        category,
        modelUrl,
        thumbnailUrl: thumbnailUrl || '',
        presets: JSON.stringify(presets || {}),
        userId: userId || null,
        isPublic: false,
        downloads: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )

    return NextResponse.json({ template, status: 'created' })
  } catch (error: any) {
    console.error('Error creating mascot template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

// Default templates for college football when database is not set up
function getDefaultTemplates() {
  return [
    {
      $id: 'default-football',
      name: 'Chrome Football',
      category: 'football',
      modelUrl: '/models/chrome-football.glb',
      thumbnailUrl: '/images/chrome-football-thumb.jpg',
      presets: JSON.stringify({
        materials: ['chrome', 'matte', 'leather'],
        colors: ['#FFD700', '#C0C0C0', '#8B4513', '#000000'],
        decals: ['team-name', 'logo', 'number']
      }),
      isPublic: true,
      downloads: 0,
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      $id: 'default-helmet',
      name: 'Football Helmet',
      category: 'helmet', 
      modelUrl: '/models/football-helmet.glb',
      thumbnailUrl: '/images/football-helmet-thumb.jpg',
      presets: JSON.stringify({
        materials: ['glossy', 'matte', 'chrome'],
        colors: ['#FFD700', '#FF0000', '#0000FF', '#000000', '#FFFFFF'],
        decals: ['team-logo', 'number', 'stripe', 'star']
      }),
      isPublic: true,
      downloads: 0,
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      $id: 'default-mascot-tiger',
      name: 'Tiger Mascot',
      category: 'mascot',
      modelUrl: '/models/tiger-mascot.glb',
      thumbnailUrl: '/images/tiger-mascot-thumb.jpg',
      presets: JSON.stringify({
        materials: ['fur', 'fabric', 'leather'],
        colors: ['#FF8C00', '#000000', '#FFFFFF', '#8B4513'],
        decals: ['team-name', 'number', 'logo'],
        accessories: ['helmet', 'jersey', 'pads']
      }),
      isPublic: true,
      downloads: 0,
      rating: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      $id: 'default-mascot-eagle',
      name: 'Eagle Mascot',
      category: 'mascot',
      modelUrl: '/models/eagle-mascot.glb',
      thumbnailUrl: '/images/eagle-mascot-thumb.jpg',
      presets: JSON.stringify({
        materials: ['feathers', 'fabric', 'metal'],
        colors: ['#8B4513', '#FFFFFF', '#FFD700', '#000000'],
        decals: ['team-name', 'wings', 'logo'],
        accessories: ['helmet', 'jersey', 'talons']
      }),
      isPublic: true,
      downloads: 0,
      rating: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}