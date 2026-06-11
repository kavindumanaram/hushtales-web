import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/api';

export const USER_PROFILE_QUERY_KEY = ['user-profile'] as const;

export function useUserProfile() {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: getUserProfile,
    staleTime: 300_000,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
  });
}
