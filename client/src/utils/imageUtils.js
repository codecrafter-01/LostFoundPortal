/**
 * Helper function to generate full image URLs for backend uploaded images.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  
  // Base backend URL on Render (or local fallback)
  const backendHost = "https://lostfoundportal-37ab.onrender.com";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${backendHost}${cleanPath}`;
};
