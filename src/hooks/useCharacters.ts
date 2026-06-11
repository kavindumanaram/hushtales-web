import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCharacter, deleteCharacter, listCharacters } from '@/lib/api';

export const CHARACTERS_QUERY_KEY = ['characters'] as const;

export function useCharacters() {
  return useQuery({
    queryKey: CHARACTERS_QUERY_KEY,
    queryFn: listCharacters,
    staleTime: 60_000,
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => qc.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY }),
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (characterId: string) => deleteCharacter(characterId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY }),
  });
}
