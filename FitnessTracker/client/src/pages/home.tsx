import { useState } from "react";
import PhotoUpload from "@/components/photo-upload";
import PhotoGallery from "@/components/photo-gallery";
import ComparisonView from "@/components/comparison-view";
import TimelineView from "@/components/timeline-view";
import VideoGenerator from "@/components/video-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-bg text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="header-title">
            🏋️ FitProgress
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto" data-testid="header-subtitle">
            Acompanhe sua jornada de transformação corporal
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 -mt-8 relative z-10">
        <Card className="glassmorphism rounded-2xl shadow-2xl p-6 md:p-8" data-testid="main-card">
          {/* Privacy Notice */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 text-green-800 dark:text-green-200" data-testid="privacy-notice">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Privacidade Garantida</h3>
                <p className="text-sm">Suas fotos são processadas localmente no seu dispositivo. Nenhuma imagem é enviada para servidores externos.</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted rounded-xl p-2 mb-8" data-testid="navigation-tabs">
              <TabsTrigger value="upload" className="px-6 py-3 rounded-lg font-semibold" data-testid="tab-upload">
                📤 Upload
              </TabsTrigger>
              <TabsTrigger value="gallery" className="px-6 py-3 rounded-lg font-semibold" data-testid="tab-gallery">
                🖼️ Galeria
              </TabsTrigger>
              <TabsTrigger value="comparison" className="px-6 py-3 rounded-lg font-semibold" data-testid="tab-comparison">
                📊 Comparação
              </TabsTrigger>
              <TabsTrigger value="timeline" className="px-6 py-3 rounded-lg font-semibold" data-testid="tab-timeline">
                📅 Timeline
              </TabsTrigger>
              <TabsTrigger value="video" className="px-6 py-3 rounded-lg font-semibold" data-testid="tab-video">
                🎥 Vídeo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" data-testid="content-upload">
              <PhotoUpload />
            </TabsContent>

            <TabsContent value="gallery" data-testid="content-gallery">
              <PhotoGallery />
            </TabsContent>

            <TabsContent value="comparison" data-testid="content-comparison">
              <ComparisonView />
            </TabsContent>

            <TabsContent value="timeline" data-testid="content-timeline">
              <TimelineView />
            </TabsContent>

            <TabsContent value="video" data-testid="content-video">
              <VideoGenerator />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
