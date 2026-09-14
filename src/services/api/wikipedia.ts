export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
}

export const fetchWikipediaSummary = async (query: string): Promise<WikipediaSummary | null> => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      console.error("API Rate Limit Hit for:", url);
    }
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source,
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
    };
  } catch (error) {
    console.error("API Rate Limit Hit for:", url, error);
    return null;
  }
};

export const searchWikipediaSpots = async (destination: string): Promise<WikipediaSummary[]> => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(destination + ' tourism places spots')}&format=json&origin=*`;
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      console.error("API Rate Limit Hit for:", url);
    }
    if (!response.ok) return [];
    const data = await response.json();
    const results = data.query?.search || [];
    return results.slice(0, 5).map((r: any) => ({
      title: r.title,
      extract: r.snippet.replace(/<[^>]*>/g, ''),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
    }));
  } catch (error) {
    console.error("API Rate Limit Hit for:", url, error);
    return [];
  }
};
