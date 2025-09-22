import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePhotos } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { generateVideoFromPhotos } from "@/lib/video-utils";
import type { Photo } from "@shared/schema";

export default function VideoGenerator() {
  const [photoType, setPhotoType] = useState("all");
  const [photoDuration, setPhotoDuration] = useState("1");
  const [transitionType, setTransitionType] = useState("fade");
  const [videoQuality, setVideoQuality] = useState("1080p");
  const [includeStats, setIncludeStats] = useState(false);
  const [includeMusic, setIncludeMusic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const { photos } = usePhotos();
  const { toast } = useToast();

  const filteredPhotos = photos?.filter((photo: Photo) => {
    if (photoType === "all") return true;
    return photo.type === photoType;
  }) || [];

  const handleGenerateVideo = async () => {
    if (filteredPhotos.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma foto encontrada para gerar o vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const videoSettings = {
        duration: parseFloat(photoDuration),
        transition: transitionType,
        quality: videoQuality,
        includeStats,
        includeMusic,
      };

      const blob = await generateVideoFromPhotos(
        filteredPhotos,
        videoSettings,
        (progressValue: number) => {
          setProgress(progressValue);
        }
      );

      setVideoBlob(blob);
      toast({
        title: "Sucesso!",
        description: "Vídeo gerado com sucesso!",
      });
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar vídeo. Verifique se o navegador suporta processamento de vídeo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transformacao-${new Date().toISOString().split('T')[0]}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O vídeo está sendo baixado para seu dispositivo.",
    });
  };

  const handleShareVideo = async () => {
    if (!videoBlob) return;

    if (navigator.share) {
      try {
        const file = new File([videoBlob], "transformacao.mp4", { type: "video/mp4" });
        await navigator.share({
          title: "Minha Transformação - FitProgress",
          text: "Confira minha jornada de transformação!",
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar o vídeo.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Compartilhamento não suportado",
        description: "Seu navegador não suporta compartilhamento direto. Use o botão de download.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Video Generation Settings */}
      <Card data-testid="video-settings-card">
        <CardHeader>
          <CardTitle>Configurações do Vídeo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-semibold mb-2">Tipo de Fotos</Label>
              <Select value={photoType} onValueChange={setPhotoType}>
                <SelectTrigger data-testid="select-photo-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fotos</SelectItem>
                  <SelectItem value="frente">Apenas frente</SelectItem>
                  <SelectItem value="perfil">Apenas perfil</SelectItem>
                  <SelectItem value="costas">Apenas costas</SelectItem>
                  <SelectItem value="pose">Apenas pose livre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="photoDuration" className="block text-sm font-semibold mb-2">
                Duração por Foto (segundos)
              </Label>
              <Input
                type="number"
                min="0.5"
                max="5"
                step="0.1"
                value={photoDuration}
                onChange={(e) => setPhotoDuration(e.target.value)}
                data-testid="input-photo-duration"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold mb-2">Transição</Label>
              <Select value={transitionType} onValueChange={setTransitionType}>
                <SelectTrigger data-testid="select-transition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Deslizar</SelectItem>
                  <SelectItem value="none">Sem transição</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-semibold mb-2">Qualidade</Label>
              <Select value={videoQuality} onValueChange={setVideoQuality}>
                <SelectTrigger data-testid="select-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="480p">480p (SD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeStats" 
                checked={includeStats}
                onCheckedChange={(checked) => setIncludeStats(checked === true)}
                data-testid="checkbox-include-stats"
              />
              <Label htmlFor="includeStats" className="text-sm font-semibold">
                Incluir estatísticas no vídeo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeMusic" 
                checked={includeMusic}
                onCheckedChange={(checked) => setIncludeMusic(checked === true)}
                data-testid="checkbox-include-music"
              />
              <Label htmlFor="includeMusic" className="text-sm font-semibold">
                Música de fundo (apenas local)
              </Label>
            </div>
          </div>

          <Button
            onClick={handleGenerateVideo}
            disabled={isGenerating || filteredPhotos.length === 0}
            className="w-full mt-6 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            data-testid="button-generate-video"
          >
            {isGenerating ? "Gerando Vídeo..." : "🎬 Gerar Vídeo da Transformação"}
          </Button>

          <p className="text-sm text-muted-foreground mt-2 text-center">
            {filteredPhotos.length} foto(s) selecionada(s)
          </p>
        </CardContent>
      </Card>

      {/* Video Preview */}
      {(isGenerating || videoBlob) && (
        <Card data-testid="video-preview-card">
          <CardHeader>
            <CardTitle>Preview do Vídeo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            {isGenerating && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Processando...</span>
                  <span data-testid="progress-text">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" data-testid="progress-bar" />
              </div>
            )}

            {/* Video Player */}
            <div className="bg-muted rounded-xl aspect-video flex items-center justify-center mb-6">
              {videoBlob ? (
                <video 
                  controls 
                  className="w-full h-full rounded-xl"
                  src={URL.createObjectURL(videoBlob)}
                  data-testid="video-player"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-4">🎥</div>
                  <p className="text-muted-foreground">
                    {isGenerating ? "Processando vídeo..." : "Seu vídeo aparecerá aqui após o processamento"}
                  </p>
                </div>
              )}
            </div>

            {/* Download/Share Buttons */}
            {videoBlob && (
              <div className="flex gap-4">
                <Button
                  onClick={handleDownloadVideo}
                  className="flex-1 bg-success text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  data-testid="button-download-video"
                >
                  💾 Baixar Vídeo
                </Button>
                <Button
                  onClick={handleShareVideo}
                  variant="outline"
                  className="px-6 py-3 rounded-xl font-semibold hover:bg-muted transition-all duration-300"
                  data-testid="button-share-video"
                >
                  📤 Compartilhar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-800 dark:text-blue-200" data-testid="processing-info">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <div>
            <h4 className="font-semibold mb-1">Processamento Local</h4>
            <p className="text-sm">O vídeo é criado diretamente no seu navegador usando WebAssembly. Nenhum dado é enviado para servidores externos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
