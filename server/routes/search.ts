import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

async function fetchHotels(destination: string) {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) return [];

    const response = await axios.get('https://api.foursquare.com/v3/places/search', {
        params: {
            query: destination,
            limit: '15'
        },
        headers: {
            accept: 'application/json',
            Authorization: apiKey
        }
    });

    if (response.data.results) {
        return await Promise.all(response.data.results.map(async (item: any, idx: number) => {
            let photoUrl = '';
            try {
                const pexelsRes = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(item.name)}&per_page=1`, {
                    headers: { Authorization: process.env.PEXELS_API_KEY }
                });
                if (pexelsRes.data.photos && pexelsRes.data.photos.length > 0) {
                    photoUrl = pexelsRes.data.photos[0].src.medium;
                }
            } catch (e) {
                console.error("Pexels error:", e);
            }
            return {
              id: `foursquare_${item.fsq_id}`,
              name: item.name,
              city: item.location.locality,
              country: item.location.country,
              photo: photoUrl,
              location: item.location?.formatted_address || destination,
              rating: (item.rating || 8) / 2,
              reviewsCount: item.popularity || 0,
              image: photoUrl, 
              pricePerNight: 4500 + (idx * 500),
              currency: 'INR',
              amenities: ['Verified'],
              provider: 'Foursquare',
              deepLink: `https://foursquare.com/v/${item.fsq_id}`,
            };
        }));
    }
    return [];
}

router.get('/hotels', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  if (!query) return res.json([]);
  
  const hotels = await fetchHotels(query);
  res.json(hotels);
});

router.get('/buses', async (req: Request, res: Response) => {
  res.json([]); 
});

router.get('/cars', async (req: Request, res: Response) => {
  res.json([]);
});

router.get('/trains', async (req: Request, res: Response) => {
  res.json([]);
});

router.get('/flights', async (req: Request, res: Response) => {
  res.json([]);
});

export default router;
