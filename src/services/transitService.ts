import { fetchTransitSchedules } from './api/groq';

export const getTransitSchedules = async (source: string, destination: string) => {
  const apiData = await fetchTransitSchedules(source, destination);
  return apiData;
};
