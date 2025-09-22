import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhotos } from "@/hooks/use-photos";
import { formatDate, calculateDaysDifference } from "@/lib/photo-utils";

export default function TimelineView() {
  const { photos } = usePhotos();

  const sortedPhotos = photos ? [...photos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ) : [];

  const getStats = () => {
    if (!photos || photos.length === 0) {
      return {
        totalPhotos: 0,
        weightLoss: 0,
        daysSince: 0,
        avgWeekly: 0,
      };
    }

    const chronologicalPhotos = [...photos].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstPhoto = chronologicalPhotos[0];
    const lastPhoto = chronologicalPhotos[chronologicalPhotos.length - 1];
    
    const daysSince = calculateDaysDifference(new Date(), firstPhoto.date);
    const weightLoss = firstPhoto.weight && lastPhoto.weight 
      ? parseFloat(firstPhoto.weight) - parseFloat(lastPhoto.weight)
      : 0;
    
    const avgWeekly = daysSince > 0 && weightLoss !== 0 
      ? (weightLoss / daysSince) * 7 
      : 0;

    return {
      totalPhotos: photos.length,
      weightLoss,
      daysSince,
      avgWeekly,
    };
  };

  const stats = getStats();

  const getWeightChange = (photo: any, index: number) => {
    if (!photo.weight || index === sortedPhotos.length - 1) return null;
    
    const olderPhoto = sortedPhotos[index + 1];
    if (!olderPhoto.weight) return null;
    
    const change = parseFloat(photo.weight) - parseFloat(olderPhoto.weight);
    return change;
  };

  return (
    <div className="space-y-8">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="stats-overview">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl text-center">
          <div className="text-3xl font-bold text-primary" data-testid="stat-total-photos">
            {stats.totalPhotos}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Total de Fotos</div>
        </div>
        <div className="bg-gradient-to-r from-success/10 to-success/5 p-6 rounded-2xl text-center">
          <div className="text-3xl font-bold text-success" data-testid="stat-weight-loss">
            {stats.weightLoss > 0 ? '-' : ''}{Math.abs(stats.weightLoss).toFixed(1)}kg
          </div>
          <div className="text-sm text-muted-foreground mt-1">Mudança de Peso</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 p-6 rounded-2xl text-center">
          <div className="text-3xl font-bold text-blue-600" data-testid="stat-days-since">
            {stats.daysSince}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Dias na Jornada</div>
        </div>
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-6 rounded-2xl text-center">
          <div className="text-3xl font-bold text-amber-600" data-testid="stat-avg-weekly">
            {stats.avgWeekly > 0 ? '-' : ''}{Math.abs(stats.avgWeekly).toFixed(1)}kg
          </div>
          <div className="text-sm text-muted-foreground mt-1">Média Semanal</div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <Card data-testid="timeline-card">
        <CardHeader>
          <CardTitle>Linha do Tempo da Transformação</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPhotos.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-timeline">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold mb-2">Timeline vazia</h3>
              <p className="text-muted-foreground">
                Adicione fotos para ver sua jornada de transformação!
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 timeline-line rounded-full"></div>
              
              {/* Timeline items */}
              <div className="space-y-8">
                {sortedPhotos.map((photo, index) => {
                  const weightChange = getWeightChange(photo, index);
                  const isFirst = index === sortedPhotos.length - 1;
                  
                  return (
                    <div 
                      key={photo.id} 
                      className="relative flex items-start gap-6"
                      data-testid={`timeline-item-${photo.id}`}
                    >
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground font-bold shrink-0 ${
                        isFirst ? 'bg-amber-500' : 'bg-primary'
                      }`}>
                        {isFirst ? '🎯' : '📷'}
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4 flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-primary" data-testid={`timeline-date-${photo.id}`}>
                                {formatDate(photo.date)}
                              </span>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${
                                isFirst 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {isFirst ? 'Baseline' : photo.type}
                              </span>
                            </div>
                            {photo.weight && (
                              <div className="mb-2">
                                <span className="text-sm text-muted-foreground">Peso: </span>
                                <span className="font-semibold" data-testid={`timeline-weight-${photo.id}`}>
                                  {photo.weight} kg
                                </span>
                                {weightChange !== null && (
                                  <span className={`text-sm ml-2 ${
                                    weightChange < 0 ? 'text-success' : weightChange > 0 ? 'text-warning' : 'text-muted-foreground'
                                  }`} data-testid={`timeline-change-${photo.id}`}>
                                    ({weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg)
                                  </span>
                                )}
                                {isFirst && (
                                  <span className="text-sm text-muted-foreground ml-2">(início)</span>
                                )}
                              </div>
                            )}
                            {photo.notes && (
                              <p className="text-sm text-muted-foreground" data-testid={`timeline-notes-${photo.id}`}>
                                {photo.notes}
                              </p>
                            )}
                          </div>
                          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
                            <img 
                              src={photo.fileData} 
                              alt={`Foto do timeline ${photo.type}`} 
                              className="w-full h-full object-cover rounded-lg"
                              data-testid={`timeline-image-${photo.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
