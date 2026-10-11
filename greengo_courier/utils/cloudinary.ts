// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'duquau5cy',
  apiKey: '876947594956552',
  apiSecret: '8mxupmdTy5AZ2HA5k4fmza65H9I',
  uploadPreset: 'greengo_courier', // Optional: create upload preset in Cloudinary dashboard
};

/**
 * Upload image to Cloudinary
 * @param imageUri - Local image URI from image picker
 * @param publicId - Optional public ID for the image
 * @returns Promise with uploaded image URL
 */
export async function uploadImageToCloudinary(
  imageUri: string,
  publicId?: string
): Promise<string> {
  try {
    const formData = new FormData();
    
    // Add file - React Native FormData format
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    
    // Use unsigned upload with upload preset (more secure)
    // If upload preset is not set, you'll need to create one in Cloudinary dashboard
    // Settings > Upload > Upload presets > Add upload preset
    // Set signing mode to "Unsigned"
    if (CLOUDINARY_CONFIG.uploadPreset) {
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    } else {
      // Fallback to signed upload (requires backend for security)
      formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
      // Note: For production, signature should be generated on backend
    }
    
    if (publicId) {
      formData.append('public_id', publicId);
    }
    
    // Add transformation parameters as query string in URL
    const transformations = [
      'w_500',
      'h_500',
      'c_fill',
      'g_face',
      'q_auto',
      'f_auto'
    ].join(',');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const urlWithTransform = `${uploadUrl}?${transformations ? `transformation=${transformations}` : ''}`;

    const response = await fetch(urlWithTransform, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - React Native will set it with boundary
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Upload image with signature (more secure, requires backend)
 * For now, using unsigned upload with upload preset
 */
export async function uploadImageWithSignature(
  imageUri: string,
  signature: string,
  timestamp: number
): Promise<string> {
  const formData = new FormData();
  
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  } as any);
  
  formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url || data.url;
}
