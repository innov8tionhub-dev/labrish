import { supabase } from './supabase';

export interface AudioFileRecord {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  duration?: number;
  story_id?: string;
  created_at: string;
}

export interface UploadAudioResult {
  url: string;
  path: string;
  size: number;
}

export const getAudioPublicUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('user-files')
    .getPublicUrl(path);

  return data.publicUrl;
};

export const getAudioSignedUrl = async (path: string, expiresIn = 3600): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('user-files')
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
};

export const deleteAudioFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('user-files')
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete audio file: ${error.message}`);
  }
};

export const listUserAudioFiles = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase.storage
    .from('user-files')
    .list(`audio/${userId}`);

  if (error) {
    throw new Error(`Failed to list audio files: ${error.message}`);
  }

  return data?.map(file => `audio/${userId}/${file.name}`) || [];
};
