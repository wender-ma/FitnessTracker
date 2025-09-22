import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotos } from "@/hooks/use-photos";
import { formatDate, calculateDaysDifference } from "@/lib/photo-utils";
import type { Photo } from "@shared/schema";

export default function ComparisonView() {
  const [beforePhotoId, setBeforePhotoId] = useState<string>("");
  const [afterPhotoId, setAfterPhotoId] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);

  const { photos } = usePhotos();

  const beforePhoto = photos?.find((p: Photo) => p.id === beforePhotoId);
  const afterPhoto = photos?.find((p: Photo) => p.id === afterPhotoId);

  const handleGenerateComparison = () => {
    if (beforePhoto && afterPhoto) {
      setShowComparison(true);
    }
  };

  const calculateMetrics = () => {
    if (!beforePhoto || !afterPhoto) return null;

    const weightChange = beforePhoto.weight && afterPhoto.weight 
      ? parseFloat(afterPhoto.weight) - parseFloat(beforePhoto.weight)
      : null;
    
    const daysDiff = calculateDaysDifference(afterPhoto.date, beforePhoto.date);
    const weeklyRate = weightChange && daysDiff > 0 
      ? (weightChange / daysDiff) * 7
      : null;

    return {
      weightChange,
      daysDiff,
      weeklyRate
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Selection */}
        <Card data-testid="photo-selection-card">
          <CardHeader>
            <CardTitle>Selecione as Fotos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Foto "Antes"</label>
              <Select value={beforePhotoId} onValueChange={setBeforePhotoId}>
                <SelectTrigger data-testid="select-before-photo">
                  <SelectValue placeholder="Selecione uma foto" />
                </SelectTrigger>
                <SelectContent>
                  {photos?.map((photo: Photo) => (
                    <SelectItem key={photo.id} value={photo.id}>
                      {formatDate(photo.date)} - {photo.type} {photo.weight && `(${photo.weight} kg)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Foto "Depois"</label>
              <Select value={afterPhotoId} onValueChange={setAfterPhotoId}>
                <SelectTrigger data-testid="select-after-photo">
                  <SelectValue placeholder="Selecione uma foto" />
                </SelectTrigger>
                <SelectContent>
                  {photos?.map((photo: Photo) => (
                    <SelectItem key={photo.id} value={photo.id}>
                      {formatDate(photo.date)} - {photo.type} {photo.weight && `(${photo.weight} kg)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateComparison}
              disabled={!beforePhoto || !afterPhoto}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-generate-comparison"
            >
              Gerar Comparação
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card data-testid="comparison-results-card">
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            {showComparison && beforePhoto && afterPhoto && metrics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <img 
                      src={beforePhoto.fileData} 
                      alt="Foto antes" 
                      className="w-full h-64 object-cover rounded-lg mb-2"
                      data-testid="before-comparison-image"
                    />
                    <p className="text-sm text-muted-foreground">Antes - {formatDate(beforePhoto.date)}</p>
                    {beforePhoto.weight && (
                      <p className="font-semibold" data-testid="before-weight">{beforePhoto.weight} kg</p>
                    )}
                  </div>
                  <div className="text-center">
                    <img 
                      src={afterPhoto.fileData} 
                      alt="Foto depois" 
                      className="w-full h-64 object-cover rounded-lg mb-2"
                      data-testid="after-comparison-image"
                    />
                    <p className="text-sm text-muted-foreground">Depois - {formatDate(afterPhoto.date)}</p>
                    {afterPhoto.weight && (
                      <p className="font-semibold" data-testid="after-weight">{afterPhoto.weight} kg</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {metrics.weightChange !== null && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Mudança de peso:</span>
                      <span className={`font-semibold ${metrics.weightChange < 0 ? 'text-success' : 'text-warning'}`} data-testid="weight-change">
                        {metrics.weightChange > 0 ? '+' : ''}{metrics.weightChange.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Período:</span>
                    <span className="font-semibold" data-testid="period-days">{metrics.daysDiff} dias</span>
                  </div>
                  
                  {metrics.weeklyRate !== null && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Taxa semanal:</span>
                      <span className={`font-semibold ${metrics.weeklyRate < 0 ? 'text-success' : 'text-warning'}`} data-testid="weekly-rate">
                        {metrics.weeklyRate > 0 ? '+' : ''}{metrics.weeklyRate.toFixed(2)} kg/semana
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-comparison-state">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-muted-foreground">
                  Selecione duas fotos para gerar a comparação
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side by Side Comparison */}
      {showComparison && beforePhoto && afterPhoto && (
        <Card data-testid="side-by-side-card">
          <CardHeader>
            <CardTitle className="text-center">Comparação Lado a Lado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative max-w-4xl w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <img 
                      src={beforePhoto.fileData} 
                      alt="Comparação antes" 
                      className="w-full rounded-lg"
                      data-testid="side-by-side-before"
                    />
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ANTES
                    </div>
                  </div>
                  <div className="relative">
                    <img 
                      src={afterPhoto.fileData} 
                      alt="Comparação depois" 
                      className="w-full rounded-lg"
                      data-testid="side-by-side-after"
                    />
                    <div className="absolute top-4 left-4 bg-success text-white px-3 py-1 rounded-full text-sm font-semibold">
                      DEPOIS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
