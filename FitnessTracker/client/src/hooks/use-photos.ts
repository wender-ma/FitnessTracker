import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Photo, InsertPhoto, UpdatePhoto } from "@shared/schema";

export function usePhotos() {
  const queryClient = useQueryClient();

  const photosQuery = useQuery<Photo[]>({
    queryKey: ['/api/photos'],
  });

  const createPhoto = useMutation({
    mutationFn: async (photo: InsertPhoto) => {
      const response = await apiRequest('POST', '/api/photos', photo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
    },
  });

  const updatePhoto = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePhoto }) => {
      const response = await apiRequest('PATCH', `/api/photos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/photos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
    },
  });

  return {
    photos: photosQuery.data,
    isLoading: photosQuery.isLoading,
    createPhoto,
    updatePhoto,
    deletePhoto,
  };
}
