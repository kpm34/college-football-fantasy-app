#!/usr/bin/env node
/**
 * Complete Video Editing Workflow for College Football Fantasy App
 * 
 * This script provides a comprehensive video production pipeline:
 * - Download videos from web URLs
 * - Cut, trim, and edit video segments
 * - Add background music with transitions
 * - Create smooth transitions between clips
 * - Add text overlays and animations
 * - Export in multiple formats
 * 
 * Usage Examples:
 * node scripts/video-workflow.js create-highlight --input "video1.mp4,video2.mp4" --music "bg-music.mp3" --output "highlight.mp4"
 * node scripts/video-workflow.js add-intro --video "main.mp4" --intro "intro.mp4" --transition "fade" --duration 2
 * node scripts/video-workflow.js web-to-video --url "https://example.com/video" --start 30 --duration 60 --output "clip.mp4"
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check dependencies
function checkDependencies() {
  const deps = [
    { cmd: 'ffmpeg', check: 'ffmpeg -version' },
    { cmd: 'sox', check: 'sox --version' }
  ];
  const missing = [];
  
  for (const dep of deps) {
    try {
      execSync(dep.check, { stdio: 'pipe' });
    } catch (error) {
      missing.push(dep.cmd);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing dependencies:', missing.join(', '));
    console.error('Install with: brew install ffmpeg sox');
    return false;
  }
  return true;
}

// Video workflow configurations
const WORKFLOWS = {
  highlight: {
    name: 'Sports Highlight Reel',
    description: 'Create engaging highlight reels with music and transitions',
    steps: ['trim', 'transition', 'music', 'text', 'export']
  },
  social: {
    name: 'Social Media Video',
    description: 'Optimized for Instagram, TikTok, Twitter',
    steps: ['format', 'trim', 'text', 'music', 'export']
  },
  presentation: {
    name: 'Presentation Video',
    description: 'Professional videos with intros, outros, and branding',
    steps: ['intro', 'main', 'outro', 'transition', 'export']
  }
};

// Transition effects library
const TRANSITIONS = {
  fade: { filter: 'xfade=transition=fade', description: 'Smooth fade transition' },
  slideright: { filter: 'xfade=transition=slideright', description: 'Slide right transition' },
  slideleft: { filter: 'xfade=transition=slideleft', description: 'Slide left transition' },
  slideup: { filter: 'xfade=transition=slideup', description: 'Slide up transition' },
  slidedown: { filter: 'xfade=transition=slidedown', description: 'Slide down transition' },
  dissolve: { filter: 'xfade=transition=dissolve', description: 'Dissolve transition' },
  wiperight: { filter: 'xfade=transition=wiperight', description: 'Wipe right transition' },
  wipereft: { filter: 'xfade=transition=wipeleft', description: 'Wipe left transition' },
  circlecrop: { filter: 'xfade=transition=circlecrop', description: 'Circle crop transition' },
  rectcrop: { filter: 'xfade=transition=rectcrop', description: 'Rectangle crop transition' }
};

// Text animation presets for football content
const TEXT_ANIMATIONS = {
  scoreboard: {
    filter: `drawtext=text='%{metadata\\:title}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.8:boxborderw=10`,
    description: 'Scoreboard-style text overlay'
  },
  player_name: {
    filter: `drawtext=text='%{metadata\\:player}':fontsize=36:fontcolor=yellow:x=50:y=h-100:box=1:boxcolor=blue@0.7:boxborderw=5`,
    description: 'Player name lower third'
  },
  highlight_text: {
    filter: `drawtext=text='%{metadata\\:highlight}':fontsize=60:fontcolor=red:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,1,4)'`,
    description: 'Centered highlight text'
  },
  countdown: {
    filter: `drawtext=text='%{eif\\:3-floor(t)\\:d}':fontsize=100:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)'`,
    description: '3-2-1 countdown animation'
  }
};

/**
 * Create a highlight reel from multiple video clips
 */
async function createHighlightReel(inputs, options = {}) {
  const {
    music,
    output = 'highlight.mp4',
    transition = 'fade',
    transitionDuration = 1,
    textOverlay,
    quality = 'high'
  } = options;

  console.log('🎬 Creating highlight reel...');
  
  // Step 1: Prepare video inputs
  const videoInputs = inputs.split(',').map(v => v.trim());
  let filterComplex = '';
  let inputArgs = [];
  
  // Build input arguments
  videoInputs.forEach((video, index) => {
    inputArgs.push('-i', video);
  });
  
  // Add music if provided
  if (music) {
    inputArgs.push('-i', music);
  }

  // Step 2: Create transition chain
  if (videoInputs.length > 1) {
    const transitionFilter = TRANSITIONS[transition]?.filter || TRANSITIONS.fade.filter;
    
    // Build filter chain for multiple videos with transitions
    for (let i = 0; i < videoInputs.length - 1; i++) {
      if (i === 0) {
        filterComplex += `[${i}][${i + 1}]${transitionFilter}:duration=${transitionDuration}:offset=5[v${i}];`;
      } else {
        filterComplex += `[v${i - 1}][${i + 1}]${transitionFilter}:duration=${transitionDuration}:offset=5[v${i}];`;
      }
    }
    
    const finalVideoLabel = `[v${videoInputs.length - 2}]`;
    
    // Add text overlay if specified
    if (textOverlay) {
      const textFilter = TEXT_ANIMATIONS[textOverlay]?.filter || TEXT_ANIMATIONS.highlight_text.filter;
      filterComplex += `${finalVideoLabel}${textFilter}[vout];`;
    } else {
      filterComplex += `${finalVideoLabel}copy[vout];`;
    }
    
    // Add audio mixing if music is provided
    if (music) {
      filterComplex += `[${videoInputs.length}:a]volume=0.3[music];[0:a][music]amix=inputs=2[aout]`;
    }
  }

  // Step 3: Execute FFmpeg command
  const outputArgs = [
    ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-map', music ? '[aout]' : '0:a',
    '-c:v', 'libx264',
    '-crf', quality === 'high' ? '18' : '23',
    '-preset', 'medium',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-y', output
  ];

  try {
    console.log('🔄 Processing video with transitions...');
    execSync(`ffmpeg ${outputArgs.join(' ')}`, { stdio: 'inherit' });
    console.log(`✅ Highlight reel created: ${output}`);
    return output;
  } catch (error) {
    console.error('❌ Failed to create highlight reel:', error.message);
    throw error;
  }
}

/**
 * Add intro/outro to video
 */
async function addIntroOutro(mainVideo, options = {}) {
  const {
    intro,
    outro,
    transition = 'fade',
    transitionDuration = 2,
    output = 'final-video.mp4'
  } = options;

  console.log('🎬 Adding intro/outro...');
  
  let inputs = [];
  let filterComplex = '';
  
  // Build input chain
  if (intro) inputs.push(intro);
  inputs.push(mainVideo);
  if (outro) inputs.push(outro);
  
  const inputArgs = inputs.flatMap(input => ['-i', input]);
  
  // Create transition chain
  if (inputs.length === 3) { // intro + main + outro
    const transitionFilter = TRANSITIONS[transition]?.filter || TRANSITIONS.fade.filter;
    filterComplex = `[0][1]${transitionFilter}:duration=${transitionDuration}:offset=3[v01];[v01][2]${transitionFilter}:duration=${transitionDuration}:offset=5[vout]`;
  } else if (inputs.length === 2) { // intro + main OR main + outro
    const transitionFilter = TRANSITIONS[transition]?.filter || TRANSITIONS.fade.filter;
    filterComplex = `[0][1]${transitionFilter}:duration=${transitionDuration}:offset=3[vout]`;
  }

  const outputArgs = [
    ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-map', '1:a', // Use main video audio
    '-c:v', 'libx264',
    '-crf', '20',
    '-preset', 'medium',
    '-y', output
  ];

  try {
    execSync(`ffmpeg ${outputArgs.join(' ')}`, { stdio: 'inherit' });
    console.log(`✅ Video with intro/outro created: ${output}`);
    return output;
  } catch (error) {
    console.error('❌ Failed to add intro/outro:', error.message);
    throw error;
  }
}

/**
 * Download and process web video
 */
async function processWebVideo(url, options = {}) {
  const {
    start = 0,
    duration = 30,
    output = 'web-video.mp4',
    quality = 'medium'
  } = options;

  console.log(`🌐 Processing video from: ${url}`);
  
  // For demo purposes - in production, you'd use youtube-dl or similar
  // This shows the FFmpeg command structure for web videos
  const args = [
    '-ss', start.toString(),
    '-i', url,
    '-t', duration.toString(),
    '-c:v', 'libx264',
    '-crf', quality === 'high' ? '20' : '25',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-y', output
  ];

  try {
    console.log('⏳ Downloading and processing...');
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log(`✅ Web video processed: ${output}`);
    return output;
  } catch (error) {
    console.error('❌ Failed to process web video:', error.message);
    throw error;
  }
}

/**
 * Create social media optimized video
 */
async function createSocialVideo(input, options = {}) {
  const {
    format = 'instagram', // instagram, tiktok, twitter
    output = 'social-video.mp4',
    text,
    music
  } = options;

  console.log(`📱 Creating ${format} video...`);
  
  // Format-specific settings
  const formats = {
    instagram: { width: 1080, height: 1080, aspect: '1:1' },
    tiktok: { width: 1080, height: 1920, aspect: '9:16' },
    twitter: { width: 1280, height: 720, aspect: '16:9' }
  };
  
  const formatConfig = formats[format] || formats.instagram;
  
  let args = [
    '-i', input,
    '-vf', `scale=${formatConfig.width}:${formatConfig.height}:force_original_aspect_ratio=1,pad=${formatConfig.width}:${formatConfig.height}:(ow-iw)/2:(oh-ih)/2`,
    '-c:v', 'libx264',
    '-crf', '23',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-t', '60', // Limit to 60 seconds
    '-y', output
  ];

  // Add music if provided
  if (music) {
    args.splice(2, 0, '-i', music);
    args.push('-filter_complex', '[1:a]volume=0.4[music];[0:a][music]amix=inputs=2[aout]');
    args.push('-map', '0:v', '-map', '[aout]');
  }

  try {
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log(`✅ ${format} video created: ${output}`);
    return output;
  } catch (error) {
    console.error('❌ Failed to create social video:', error.message);
    throw error;
  }
}

/**
 * Batch process multiple videos
 */
async function batchProcess(inputPattern, operation, options = {}) {
  console.log(`🔄 Batch processing: ${inputPattern}`);
  
  // Get all matching files
  const files = execSync(`ls ${inputPattern}`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f.length > 0);
  
  console.log(`Found ${files.length} files to process`);
  
  const results = [];
  
  for (const file of files) {
    const outputFile = `processed_${path.basename(file)}`;
    
    try {
      console.log(`Processing: ${file}`);
      
      switch (operation) {
        case 'compress':
          execSync(`ffmpeg -i "${file}" -crf 28 -preset fast -c:a aac -y "${outputFile}"`, { stdio: 'pipe' });
          break;
        case 'thumbnail':
          const thumbFile = `thumb_${path.basename(file, path.extname(file))}.jpg`;
          execSync(`ffmpeg -i "${file}" -ss 00:00:01 -vframes 1 -y "${thumbFile}"`, { stdio: 'pipe' });
          results.push(thumbFile);
          break;
        default:
          console.warn(`Unknown operation: ${operation}`);
      }
      
      results.push(outputFile);
    } catch (error) {
      console.error(`Failed to process ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Batch processing complete. Processed ${results.length} files.`);
  return results;
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Parse arguments
  function getArg(flag, defaultValue = null) {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : defaultValue;
  }
  
  function hasFlag(flag) {
    return args.includes(flag);
  }
  
  try {
    switch (command) {
      case 'create-highlight':
        const inputs = getArg('--input');
        const music = getArg('--music');
        const output = getArg('--output', 'highlight.mp4');
        const transition = getArg('--transition', 'fade');
        const textOverlay = getArg('--text');
        
        if (!inputs) {
          console.error('Usage: video-workflow.js create-highlight --input "video1.mp4,video2.mp4" [--music bg.mp3] [--output highlight.mp4] [--transition fade] [--text scoreboard]');
          process.exit(1);
        }
        
        createHighlightReel(inputs, { music, output, transition, textOverlay });
        break;
        
      case 'add-intro':
        const mainVideo = getArg('--video');
        const intro = getArg('--intro');
        const outro = getArg('--outro');
        const introOutput = getArg('--output', 'final-video.mp4');
        const introTransition = getArg('--transition', 'fade');
        
        if (!mainVideo || (!intro && !outro)) {
          console.error('Usage: video-workflow.js add-intro --video main.mp4 [--intro intro.mp4] [--outro outro.mp4] [--output final.mp4] [--transition fade]');
          process.exit(1);
        }
        
        addIntroOutro(mainVideo, { intro, outro, output: introOutput, transition: introTransition });
        break;
        
      case 'web-to-video':
        const url = getArg('--url');
        const start = parseInt(getArg('--start', '0'));
        const duration = parseInt(getArg('--duration', '30'));
        const webOutput = getArg('--output', 'web-video.mp4');
        
        if (!url) {
          console.error('Usage: video-workflow.js web-to-video --url "https://example.com/video" [--start 30] [--duration 60] [--output clip.mp4]');
          process.exit(1);
        }
        
        processWebVideo(url, { start, duration, output: webOutput });
        break;
        
      case 'social':
        const socialInput = getArg('--input');
        const socialFormat = getArg('--format', 'instagram');
        const socialOutput = getArg('--output', 'social-video.mp4');
        const socialMusic = getArg('--music');
        
        if (!socialInput) {
          console.error('Usage: video-workflow.js social --input video.mp4 [--format instagram|tiktok|twitter] [--music bg.mp3] [--output social.mp4]');
          process.exit(1);
        }
        
        createSocialVideo(socialInput, { format: socialFormat, output: socialOutput, music: socialMusic });
        break;
        
      case 'batch':
        const pattern = getArg('--pattern');
        const operation = getArg('--operation');
        
        if (!pattern || !operation) {
          console.error('Usage: video-workflow.js batch --pattern "*.mp4" --operation compress|thumbnail');
          process.exit(1);
        }
        
        batchProcess(pattern, operation);
        break;
        
      case 'help':
      case '--help':
        console.log(`
🎬 Video Workflow Tool - College Football Fantasy App

Available Commands:
  create-highlight    Create highlight reel from multiple clips
  add-intro          Add intro/outro to videos  
  web-to-video       Process video from web URL
  social             Create social media optimized video
  batch              Batch process multiple videos
  
Available Transitions:
  ${Object.keys(TRANSITIONS).join(', ')}
  
Text Overlays:
  ${Object.keys(TEXT_ANIMATIONS).join(', ')}
  
Examples:
  # Create highlight reel
  node video-workflow.js create-highlight --input "clip1.mp4,clip2.mp4,clip3.mp4" --music "bg-music.mp3" --transition slideright --text scoreboard --output "highlights.mp4"
  
  # Add professional intro
  node video-workflow.js add-intro --video "main-content.mp4" --intro "brand-intro.mp4" --outro "subscribe.mp4" --transition dissolve
  
  # Create Instagram video
  node video-workflow.js social --input "raw-video.mp4" --format instagram --music "trending-audio.mp3"
  
  # Batch compress videos
  node video-workflow.js batch --pattern "raw-footage/*.mp4" --operation compress
        `);
        break;
        
      default:
        console.error('Unknown command. Use --help for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
    process.exit(1);
  }
}

module.exports = {
  createHighlightReel,
  addIntroOutro,
  processWebVideo,
  createSocialVideo,
  batchProcess,
  TRANSITIONS,
  TEXT_ANIMATIONS,
  WORKFLOWS
};