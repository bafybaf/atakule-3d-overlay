import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Set FFmpeg path
ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');

/**
 * Run ffprobe and return essential metadata
 * @param {string} filePath
 * @returns {Promise<{width:number,height:number,duration:number,fps:number}>}
 */
export function ffprobeVideo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      const stream = data.streams.find(s => s.codec_type === 'video') || {};
      const rFrame = (stream.r_frame_rate || '0/0').split('/');
      const fps = Number(rFrame[0]) / Number(rFrame[1] || 1) || 0;
      resolve({
        width: stream.width,
        height: stream.height,
        duration: Number(data.format.duration || 0),
        fps,
      });
    });
  });
}

/**
 * Compose video with transparent overlay webm
 * @param {{videoPath:string,overlayPath:string,outputPath:string,crf:number,preset:string,duration:number}} opts
 * @returns {Promise<string>} absolute output path
 */
export function renderWithOverlay({ videoPath, overlayPath, outputPath, crf = 18, preset = 'medium', duration }) {
  return new Promise((resolve, reject) => {
    // Convert all paths to absolute
    const absVideoPath = path.isAbsolute(videoPath) ? videoPath : path.join(process.cwd(), videoPath);
    const absOverlayPath = path.isAbsolute(overlayPath) ? overlayPath : path.join(process.cwd(), overlayPath);
    const absOutput = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);
    
    console.log('Video path:', absVideoPath);
    console.log('Overlay path:', absOverlayPath);
    console.log('Output path:', absOutput);
    
    // Check if files exist
    if (!fs.existsSync(absVideoPath)) {
      return reject(new Error(`Video file not found: ${absVideoPath}`));
    }
    if (!fs.existsSync(absOverlayPath)) {
      return reject(new Error(`Overlay file not found: ${absOverlayPath}`));
    }
    
    fs.mkdirSync(path.dirname(absOutput), { recursive: true });

    // Video arka plan + şeffaf overlay - ses korumalı komut
    const command = ffmpeg()
      .input(absVideoPath)
      .input(absOverlayPath)
      .outputOptions([
        '-y',                   // mevcut dosyayı üzerine yaz
        '-filter_complex', '[0:v][1:v]overlay=0:0[v]', // basit overlay
        '-map', '[v]',          // video stream'i map et
        '-map', '0:a?',         // ses stream'ini map et (varsa)
        '-c:v', 'libx264',      // H.264 encode
        '-c:a', 'mp3',          // AAC ses encode
        '-b:a', '128k',         // ses bitrate
        '-ar', '44100',         // ses sample rate
        '-ac', '2',             // stereo ses
        '-crf', '60',           // daha iyi kalite ama hızlı
        '-preset', 'fast',      // hızlı ama kaliteli preset
        '-pix_fmt', 'yuv420p'   // uyumlu renk formatı
      ]);
    // Add duration limit if specified
    if (duration && duration > 0) {
      command.duration(duration);
    }

    command
      .output(absOutput)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('end', () => {
        console.log('FFmpeg finished successfully');
        resolve(absOutput);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });

    command.run();
  });
}


