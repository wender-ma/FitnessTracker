import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePhotos } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { formatDate, calculateWeightDifference } from "@/lib/photo-utils";
import { Trash2 } from "lucide-react";
import type { Photo } from "@shared/schema";

export default function PhotoGallery() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [searchNotes, setSearchNotes] = useState("");

  const { photos, deletePhoto } = usePhotos();
  const { toast } = useToast();

  const filteredPhotos = photos?.filter((photo: Photo) => {
    const matchesType = !filterType || filterType === "all" || photo.type === filterType;
    const matchesPeriod = !filterPeriod || filterPeriod === "all" || (() => {
      const photoDate = new Date(photo.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterPeriod) {
        case "7": return daysDiff <= 7;
        case "30": return daysDiff <= 30;
        case "90": return daysDiff <= 90;
        default: return true;
      }
    })();
    const matchesSearch = !searchNotes || photo.notes?.toLowerCase().includes(searchNotes.toLowerCase());
    
    return matchesType && matchesPeriod && matchesSearch;
  }) || [];

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta foto?")) {
      try {
        await deletePhoto.mutateAsync(id);
        toast({
          title: "Foto excluída",
          description: "A foto foi removida com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a foto.",
          variant: "destructive",
        });
      }
    }
  };

  const getInitialWeight = () => {
    if (!photos || photos.length === 0) return null;
    const sortedPhotos = [...photos].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedPhotos[0].weight;
  };

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4" data-testid="filter-controls">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48" data-testid="filter-type">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="frente">Frente</SelectItem>
            <SelectItem value="perfil">Perfil</SelectItem>
            <SelectItem value="costas">Costas</SelectItem>
            <SelectItem value="pose">Pose Livre</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-48" data-testid="filter-period">
            <SelectValue placeholder="Todos os períodos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Último mês</SelectItem>
            <SelectItem value="90">Últimos 3 meses</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Buscar por observações..."
          value={searchNotes}
          onChange={(e) => setSearchNotes(e.target.value)}
          className="flex-1 min-w-0"
          data-testid="search-notes"
        />
      </div>

      {/* Photo Grid */}
      <div className="photo-grid" data-testid="photo-grid">
        {filteredPhotos.length === 0 ? (
          <div className="col-span-full text-center py-12" data-testid="empty-state">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-semibold mb-2">Nenhuma foto encontrada</h3>
            <p className="text-muted-foreground">
              {photos?.length === 0 
                ? "Adicione suas primeiras fotos na aba Upload!" 
                : "Tente ajustar os filtros para encontrar suas fotos."}
            </p>
          </div>
        ) : (
          filteredPhotos.map((photo: Photo) => (
            <Card 
              key={photo.id} 
              className="photo-item bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              data-testid={`photo-item-${photo.id}`}
            >
              <img 
                src={photo.fileData} 
                alt={`Foto de progresso ${photo.type}`} 
                className="w-full h-64 object-cover"
                data-testid={`photo-image-${photo.id}`}
              />
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-primary" data-testid={`photo-date-${photo.id}`}>
                    {formatDate(photo.date)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded-full h-auto"
                    data-testid={`button-delete-${photo.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <span 
                  className="inline-block bg-muted px-3 py-1 text-sm rounded-full text-muted-foreground mb-2 capitalize"
                  data-testid={`photo-type-${photo.id}`}
                >
                  {photo.type}
                </span>
                
                {photo.weight && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium" data-testid={`photo-weight-${photo.id}`}>
                      {photo.weight} kg
                    </span>
                    {getInitialWeight() && (
                      <span className="text-xs text-muted-foreground" data-testid={`weight-change-${photo.id}`}>
                        {calculateWeightDifference(parseFloat(photo.weight), getInitialWeight()!)}
                      </span>
                    )}
                  </div>
                )}
                
                {photo.notes && (
                  <p className="text-sm text-muted-foreground" data-testid={`photo-notes-${photo.id}`}>
                    {photo.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
