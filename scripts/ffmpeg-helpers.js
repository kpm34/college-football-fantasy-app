#!/usr/bin/env node
/**
 * FFmpeg Utilities for Local Development
 * 
 * IMPORTANT: These utilities are for LOCAL USE ONLY
 * They are NOT exposed as public API routes for security reasons
 * 
 * Prerequisites:
 * - FFmpeg installed locally: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)
 * - Usage: node scripts/ffmpeg-helpers.js [command] [options]
 * 
 * Examples:
 * - node scripts/ffmpeg-helpers.js convert input.mov output.mp4
 * - node scripts/ffmpeg-helpers.js compress video.mp4 compressed.mp4 --quality medium
 * - node scripts/ffmpeg-helpers.js extract-frames video.mp4 frames/ --fps 1
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if FFmpeg is available
function checkFFmpegAvailable() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg not found. Please install it first:');
    console.error('  macOS: brew install ffmpeg');
    console.error('  Ubuntu/Debian: sudo apt-get install ffmpeg');
    console.error('  Windows: Download from https://ffmpeg.org/download.html');
    return false;
  }
}

// Quality presets for video conversion
const QUALITY_PRESETS = {
  low: {
    video: ['-crf', '28', '-preset', 'fast'],
    audio: ['-b:a', '96k']
  },
  medium: {
    video: ['-crf', '23', '-preset', 'medium'],
    audio: ['-b:a', '128k']
  },
  high: {
    video: ['-crf', '18', '-preset', 'slow'],
    audio: ['-b:a', '192k']
  },
  ultra: {
    video: ['-crf', '15', '-preset', 'veryslow'],
    audio: ['-b:a', '256k']
  }
};

/**
 * Convert video format
 */
function convertVideo(inputPath, outputPath, options = {}) {
  const {
    quality = 'medium',
    width,
    height,
    fps,
    startTime,
    duration,
    codec = 'libx264'
  } = options;

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS.medium;
  
  let args = [
    '-i', inputPath,
    '-c:v', codec,
    ...preset.video,
    ...preset.audio,
  ];

  // Add optional parameters
  if (width && height) {
    args.push('-s', `${width}x${height}`);
  }
  if (fps) {
    args.push('-r', fps.toString());
  }
  if (startTime) {
    args.push('-ss', startTime);
  }
  if (duration) {
    args.push('-t', duration);
  }

  args.push('-y', outputPath); // Overwrite output file

  console.log(`🎬 Converting: ${inputPath} → ${outputPath}`);
  console.log(`   Quality: ${quality}, Codec: ${codec}`);

  try {
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Conversion completed successfully');
    return outputPath;
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    throw error;
  }
}

/**
 * Compress video file
 */
function compressVideo(inputPath, outputPath, options = {}) {
  const { quality = 'medium', targetSizeMB } = options;

  if (targetSizeMB) {
    // Calculate bitrate for target file size
    const duration = getVideoDuration(inputPath);
    const targetBitrate = Math.floor((targetSizeMB * 8192) / duration); // kbps
    
    return convertVideo(inputPath, outputPath, {
      ...options,
      customArgs: ['-b:v', `${targetBitrate}k`]
    });
  }

  return convertVideo(inputPath, outputPath, { ...options, quality });
}

/**
 * Extract frames from video
 */
function extractFrames(inputPath, outputDir, options = {}) {
  const { fps = 1, format = 'png', startTime, duration } = options;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let args = ['-i', inputPath];

  if (startTime) args.push('-ss', startTime);
  if (duration) args.push('-t', duration);

  args.push(
    '-vf', `fps=${fps}`,
    '-y',
    path.join(outputDir, `frame_%04d.${format}`)
  );

  console.log(`📸 Extracting frames: ${fps} fps → ${outputDir}`);

  try {
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Frame extraction completed');
    return outputDir;
  } catch (error) {
    console.error('❌ Frame extraction failed:', error.message);
    throw error;
  }
}

/**
 * Create video from images
 */
function createVideoFromImages(inputPattern, outputPath, options = {}) {
  const { fps = 24, quality = 'medium' } = options;
  const preset = QUALITY_PRESETS[quality];

  const args = [
    '-framerate', fps.toString(),
    '-pattern_type', 'glob',
    '-i', inputPattern,
    '-c:v', 'libx264',
    ...preset.video,
    '-pix_fmt', 'yuv420p',
    '-y', outputPath
  ];

  console.log(`🎞️  Creating video from images: ${inputPattern} → ${outputPath}`);

  try {
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Video creation completed');
    return outputPath;
  } catch (error) {
    console.error('❌ Video creation failed:', error.message);
    throw error;
  }
}

/**
 * Get video information
 */
function getVideoInfo(inputPath) {
  try {
    const output = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`, 
      { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    console.error('❌ Failed to get video info:', error.message);
    throw error;
  }
}

/**
 * Get video duration in seconds
 */
function getVideoDuration(inputPath) {
  const info = getVideoInfo(inputPath);
  return parseFloat(info.format.duration);
}

/**
 * Create video thumbnail
 */
function createThumbnail(inputPath, outputPath, options = {}) {
  const { timeOffset = '00:00:01', size = '320x240' } = options;

  const args = [
    '-i', inputPath,
    '-ss', timeOffset,
    '-vframes', '1',
    '-s', size,
    '-y', outputPath
  ];

  console.log(`🖼️  Creating thumbnail: ${inputPath} → ${outputPath}`);

  try {
    execSync(`ffmpeg ${args.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Thumbnail created successfully');
    return outputPath;
  } catch (error) {
    console.error('❌ Thumbnail creation failed:', error.message);
    throw error;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!checkFFmpegAvailable()) {
    process.exit(1);
  }

  try {
    switch (command) {
      case 'convert':
        if (args.length < 3) {
          console.error('Usage: node ffmpeg-helpers.js convert <input> <output> [--quality low|medium|high|ultra]');
          process.exit(1);
        }
        const quality = args.includes('--quality') ? args[args.indexOf('--quality') + 1] : 'medium';
        convertVideo(args[1], args[2], { quality });
        break;

      case 'compress':
        if (args.length < 3) {
          console.error('Usage: node ffmpeg-helpers.js compress <input> <output> [--quality medium] [--target-size 10]');
          process.exit(1);
        }
        const compressQuality = args.includes('--quality') ? args[args.indexOf('--quality') + 1] : 'medium';
        const targetSizeMB = args.includes('--target-size') ? parseInt(args[args.indexOf('--target-size') + 1]) : null;
        compressVideo(args[1], args[2], { quality: compressQuality, targetSizeMB });
        break;

      case 'extract-frames':
        if (args.length < 3) {
          console.error('Usage: node ffmpeg-helpers.js extract-frames <input> <output-dir> [--fps 1]');
          process.exit(1);
        }
        const fps = args.includes('--fps') ? parseFloat(args[args.indexOf('--fps') + 1]) : 1;
        extractFrames(args[1], args[2], { fps });
        break;

      case 'create-video':
        if (args.length < 3) {
          console.error('Usage: node ffmpeg-helpers.js create-video <input-pattern> <output> [--fps 24]');
          process.exit(1);
        }
        const videoFps = args.includes('--fps') ? parseInt(args[args.indexOf('--fps') + 1]) : 24;
        createVideoFromImages(args[1], args[2], { fps: videoFps });
        break;

      case 'info':
        if (args.length < 2) {
          console.error('Usage: node ffmpeg-helpers.js info <input>');
          process.exit(1);
        }
        const info = getVideoInfo(args[1]);
        console.log('📊 Video Information:');
        console.log(JSON.stringify(info, null, 2));
        break;

      case 'thumbnail':
        if (args.length < 3) {
          console.error('Usage: node ffmpeg-helpers.js thumbnail <input> <output> [--time 00:00:01] [--size 320x240]');
          process.exit(1);
        }
        const timeOffset = args.includes('--time') ? args[args.indexOf('--time') + 1] : '00:00:01';
        const size = args.includes('--size') ? args[args.indexOf('--size') + 1] : '320x240';
        createThumbnail(args[1], args[2], { timeOffset, size });
        break;

      default:
        console.log('🎬 FFmpeg Helper Utilities');
        console.log('');
        console.log('Available commands:');
        console.log('  convert <input> <output> [--quality low|medium|high|ultra]');
        console.log('  compress <input> <output> [--quality medium] [--target-size 10]');
        console.log('  extract-frames <input> <output-dir> [--fps 1]');
        console.log('  create-video <input-pattern> <output> [--fps 24]');
        console.log('  info <input>');
        console.log('  thumbnail <input> <output> [--time 00:00:01] [--size 320x240]');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/ffmpeg-helpers.js convert input.mov output.mp4 --quality high');
        console.log('  node scripts/ffmpeg-helpers.js compress large.mp4 small.mp4 --target-size 10');
        console.log('  node scripts/ffmpeg-helpers.js extract-frames video.mp4 frames/ --fps 0.5');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Export functions for programmatic use
module.exports = {
  checkFFmpegAvailable,
  convertVideo,
  compressVideo,
  extractFrames,
  createVideoFromImages,
  getVideoInfo,
  getVideoDuration,
  createThumbnail,
  QUALITY_PRESETS
};