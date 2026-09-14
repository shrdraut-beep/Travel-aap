import { getTrainDetails as getDetailsFromService } from '../services/trainCatalogService';

export interface TrainDetails {
  trainNumber: string;
  trainName: string;
  name: string;
  accommodation: string;
  accommodationTypes: string[];
  availableClasses: string[];
  classes: Array<{ code: string; name: string; priceMultiplier: number }>;
  isFound: boolean;
}

/**
 * Utility lookup function getTrainDetails(trainNumber)
 * Imports trainname.json and returns the official train name and available classes,
 * or fallback with 'Express Train {trainNumber}' if not found.
 */
export function getTrainDetails(trainNumber: string | number): TrainDetails {
  return getDetailsFromService(trainNumber);
}
