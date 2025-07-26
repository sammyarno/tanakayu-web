import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/plugins/supabase/client';
import { useUserAuthStore } from '@/store/userAuthStore';

interface UpdateProfileData {
  displayName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const updateProfile = async (data: UpdateProfileData) => {
  const supabase = getSupabaseClient();
  
  // Prepare the update data for Supabase auth
  const updateData: any = {};
  
  if (data.email) {
    updateData.email = data.email;
  }
  
  if (data.password) {
    updateData.password = data.password;
  }
  
  // Update user metadata for display name and phone
  if (data.displayName || data.phone) {
    updateData.data = {
      ...(data.displayName && { display_name: data.displayName, full_name: data.displayName }),
      ...(data.phone && { phone: data.phone }),
    };
  }
  
  const { data: updatedUser, error } = await supabase.auth.updateUser(updateData);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return updatedUser;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useUserAuthStore();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the user store with the new data
      if (data.user) {
        updateUser(data.user);
      }
      
      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};