export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function calculateDaysDifference(laterDate: Date | string, earlierDate: Date | string): number {
  const later = new Date(laterDate);
  const earlier = new Date(earlierDate);
  const diffTime = Math.abs(later.getTime() - earlier.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateWeightDifference(currentWeight: number, initialWeight: number): string {
  const diff = currentWeight - initialWeight;
  if (diff === 0) return "sem mudança";
  if (diff > 0) return `+${diff.toFixed(1)}kg desde início`;
  return `${diff.toFixed(1)}kg desde início`;
}

export function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 600): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = URL.createObjectURL(file);
  });
}
