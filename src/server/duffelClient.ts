import { Duffel } from '@duffel/api';

const duffelToken = process.env.DUFFEL_ACCESS_TOKEN || process.env.VITE_DUFFEL_API_KEY || '';

export const duffel = new Duffel({
  token: duffelToken,
});
