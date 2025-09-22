import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePhotos } from "@/hooks/use-photos";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64 } from "@/lib/photo-utils";

export default function PhotoUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoType, setPhotoType] = useState("frente");
  const [photoWeight, setPhotoWeight] = useState("");
  const [photoNotes, setPhotoNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPhoto } = usePhotos();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos uma foto.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const file of selectedFiles) {
        const fileData = await fileToBase64(file);
        
        const photoData = {
          date: new Date(photoDate).toISOString(),
          type: photoType as "frente" | "perfil" | "costas" | "pose",
          weight: photoWeight ? photoWeight : null,
          notes: photoNotes || null,
          filename: file.name,
          fileData,
        };
        console.log('Sending photo data:', photoData);
        await createPhoto.mutateAsync(photoData);
      }

      toast({
        title: "Sucesso!",
        description: `${selectedFiles.length} foto(s) enviada(s) com sucesso.`,
      });

      // Reset form
      setSelectedFiles([]);
      setPhotoNotes("");
      setPhotoWeight("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar fotos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`upload-area border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer bg-card transition-all duration-300 ${
          dragActive ? "dragover border-primary bg-primary/5" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="upload-area"
      >
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-2xl font-semibold mb-2">
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} arquivo(s) selecionado(s)` 
            : "Arraste suas fotos aqui"}
        </h3>
        <p className="text-muted-foreground mb-6">ou clique para selecionar arquivos</p>
        <Button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300" data-testid="button-choose-photos">
          Escolher Fotos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          data-testid="input-file"
        />
      </div>

      {/* Photo Metadata Form */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="metadata-form">
          <div>
            <Label htmlFor="photoDate" className="block text-sm font-semibold mb-2">
              Data da Foto
            </Label>
            <Input
              type="date"
              id="photoDate"
              value={photoDate}
              onChange={(e) => setPhotoDate(e.target.value)}
              className="w-full"
              data-testid="input-date"
            />
          </div>
          
          <div>
            <Label className="block text-sm font-semibold mb-2">Tipo de Foto</Label>
            <Select value={photoType} onValueChange={setPhotoType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frente">Frente</SelectItem>
                <SelectItem value="perfil">Perfil</SelectItem>
                <SelectItem value="costas">Costas</SelectItem>
                <SelectItem value="pose">Pose Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="photoWeight" className="block text-sm font-semibold mb-2">
              Peso (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              id="photoWeight"
              value={photoWeight}
              onChange={(e) => setPhotoWeight(e.target.value)}
              placeholder="Ex: 75.5"
              data-testid="input-weight"
            />
          </div>
          
          <div className="md:col-span-3">
            <Label htmlFor="photoNotes" className="block text-sm font-semibold mb-2">
              Observações
            </Label>
            <Textarea
              id="photoNotes"
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              rows={3}
              placeholder="Ex: Após treino de pernas, boa definição..."
              data-testid="textarea-notes"
            />
          </div>
          
          <div className="md:col-span-3">
            <Button
              onClick={handleSubmit}
              disabled={createPhoto.isPending}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-submit"
            >
              {createPhoto.isPending ? "Enviando..." : "Salvar Fotos"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
