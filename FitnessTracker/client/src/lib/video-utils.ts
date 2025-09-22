import type { Photo } from "@shared/schema";

interface VideoSettings {
  duration: number;
  transition: string;
  quality: string;
  includeStats: boolean;
  includeMusic: boolean;
}

export async function generateVideoFromPhotos(
  photos: Photo[],
  settings: VideoSettings,
  onProgress: (progress: number) => void
): Promise<Blob> {
  // Sort photos by date
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  onProgress(10);

  // Create canvas for video frames
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set dimensions based on quality
  const dimensions = getVideoDimensions(settings.quality);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  onProgress(20);

  // Load all images
  const images = await loadImages(sortedPhotos);
  onProgress(40);

  // Create video frames
  const frames: ImageData[] = [];
  const totalFrames = sortedPhotos.length * Math.ceil(settings.duration * 30); // 30 FPS

  for (let i = 0; i < sortedPhotos.length; i++) {
    const img = images[i];
    const framesForThisPhoto = Math.ceil(settings.duration * 30);
    
    for (let frame = 0; frame < framesForThisPhoto; frame++) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw image (centered and scaled to fit)
      drawImageCentered(ctx, img, canvas.width, canvas.height);
      
      // Add date overlay if enabled
      if (settings.includeStats) {
        drawDateOverlay(ctx, sortedPhotos[i], canvas.width, canvas.height);
      }
      
      // Capture frame
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    
    onProgress(40 + (i / sortedPhotos.length) * 40);
  }

  onProgress(80);

  // Convert frames to video using MediaRecorder API (simplified approach)
  const videoBlob = await createVideoFromFrames(frames, canvas.width, canvas.height, settings);
  
  onProgress(100);
  return videoBlob;
}

async function loadImages(photos: Photo[]): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = [];
  
  for (const photo of photos) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = photo.fileData;
    });
    images.push(img);
  }
  
  return images;
}

function getVideoDimensions(quality: string): { width: number; height: number } {
  switch (quality) {
    case '480p':
      return { width: 854, height: 480 };
    case '720p':
      return { width: 1280, height: 720 };
    case '1080p':
      return { width: 1920, height: 1080 };
    default:
      return { width: 1280, height: 720 };
  }
}

function drawImageCentered(
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  canvasWidth: number, 
  canvasHeight: number
) {
  const imgAspect = img.width / img.height;
  const canvasAspect = canvasWidth / canvasHeight;
  
  let drawWidth, drawHeight, drawX, drawY;
  
  if (imgAspect > canvasAspect) {
    // Image is wider than canvas
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgAspect;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  } else {
    // Image is taller than canvas
    drawWidth = canvasHeight * imgAspect;
    drawHeight = canvasHeight;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  }
  
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function drawDateOverlay(
  ctx: CanvasRenderingContext2D, 
  photo: Photo, 
  canvasWidth: number, 
  canvasHeight: number
) {
  ctx.save();
  
  // Set font style
  const fontSize = Math.max(16, canvasWidth * 0.02);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  
  // Format date
  const dateStr = new Date(photo.date).toLocaleDateString('pt-BR');
  const text = `${dateStr}${photo.weight ? ` - ${photo.weight}kg` : ''}`;
  
  // Measure text
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  
  // Position in bottom right with padding
  const padding = 20;
  const x = canvasWidth - textWidth - padding;
  const y = canvasHeight - padding;
  
  // Draw background
  ctx.fillRect(x - 10, y - textHeight, textWidth + 20, textHeight + 10);
  
  // Draw text
  ctx.fillStyle = 'white';
  ctx.fillText(text, x, y);
  
  ctx.restore();
}

async function createVideoFromFrames(
  frames: ImageData[], 
  width: number, 
  height: number, 
  settings: VideoSettings
): Promise<Blob> {
  // This is a simplified implementation using canvas and MediaRecorder
  // In a real-world scenario, you might want to use FFmpeg.js for better video encoding
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  const stream = canvas.captureStream(30); // 30 FPS
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
  });
  
  const chunks: Blob[] = [];
  
  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
    
    mediaRecorder.onerror = reject;
    
    mediaRecorder.start();
    
    // Play through frames
    let frameIndex = 0;
    const frameInterval = setInterval(() => {
      if (frameIndex >= frames.length) {
        clearInterval(frameInterval);
        mediaRecorder.stop();
        return;
      }
      
      ctx.putImageData(frames[frameIndex], 0, 0);
      frameIndex++;
    }, 1000 / 30); // 30 FPS
  });
}
