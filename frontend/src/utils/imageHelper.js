export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api$/, '');
  
  return `${baseUrl}${url}`;
};
