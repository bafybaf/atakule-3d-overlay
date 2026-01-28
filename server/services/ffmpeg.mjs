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

    

    const command = ffmpeg()
    .input(absVideoPath)
    .input(absOverlayPath)
    .outputOptions([
      '-y',
      '-filter_complex', '[0:v][1:v]overlay=0:0:format=auto[v]',
      '-map', '[v]',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'veryfast',           // kalite ve hız dengesi
      '-tune', 'fastdecode',         // mobil cihazlarda takılmayı azaltır
      '-profile:v', 'baseline',      // eski mobil cihazlarla uyumlu
      '-level', '3.1',
      '-crf', '50',                  // kalite (0–51 arası, 23 iyi dengedir)
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-ac', '2',
      '-r', '20',
      '-movflags', '+faststart'      // videonun hızlı başlamasını sağlar
    ]);
    

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


