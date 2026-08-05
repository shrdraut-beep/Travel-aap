export interface YouTubeVideo {
  videoId: string;
  title: string;
  url: string;
  thumbnail: string;
  author: {
    name: string;
  };
}

export const searchYouTube = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to search YouTube");
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error in searchYouTube:", error);
    return [];
  }
};
