/**
 * Travelport Service with RTAIP (RoutTripo AI Platform) Agent Architecture
 * Bridges Travelport Universal API / TripServices GDS with strictly typed, validated Agents.
 */

import { travelportService } from './travelport.js';
import {
  FlightSearchAgent,
  FlightPriceAgent,
  FlightBookAgent,
  LodgingSearchAgent,
  PropertyDeduplicationAgent,
  RateComparisonAgent,
  LodgingBookAgent
} from './rtaip/index.js';
import type {
  FlightSearchInput,
  FlightSearchOutput,
  FlightPriceInput,
  FlightPriceOutput,
  FlightBookInput,
  FlightBookOutput,
  LodgingSearchInput,
  LodgingSearchOutput,
  LodgingBookInput,
  LodgingBookOutput,
  LodgingProperty,
  PropertyDeduplicationOutput,
  RateComparisonOutput
} from './rtaip/index.js';

// Singleton agent instances
export const flightSearchAgent = new FlightSearchAgent();
export const flightPriceAgent = new FlightPriceAgent();
export const flightBookAgent = new FlightBookAgent();

export const lodgingSearchAgent = new LodgingSearchAgent();
export const propertyDeduplicationAgent = new PropertyDeduplicationAgent();
export const rateComparisonAgent = new RateComparisonAgent();
export const lodgingBookAgent = new LodgingBookAgent();

export interface LodgingPipelineData {
  properties: LodgingProperty[];
  totalFound: number;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  searchId: string;
  deduplicationStats?: PropertyDeduplicationOutput;
  rateComparisonStats?: RateComparisonOutput;
}

export interface LodgingPipelineResult {
  success: boolean;
  data?: LodgingPipelineData;
  error?: { message: string; code: string; details?: any };
  stage: string;
  agentName: string;
  executionTimeMs?: number;
}

/**
 * End-to-end lodging search pipeline:
 * 1. Search multi-source stays (Travelport GDS + Curated)
 * 2. Deduplicate properties using normalized name and geo similarity
 * 3. Rate comparison engine with multi-channel pricing and best rate guarantee
 */
export async function searchLodgingPipeline(input: LodgingSearchInput): Promise<LodgingPipelineResult> {
  // 1. Search
  const searchResult = await lodgingSearchAgent.execute(input);
  if (!searchResult.success || !searchResult.data) {
    return {
      success: false,
      error: searchResult.error,
      stage: searchResult.stage,
      agentName: 'RTAIP_LodgingPipelineOrchestrator',
      executionTimeMs: searchResult.executionTimeMs
    };
  }

  // 2. Deduplicate
  const dedupResult = await propertyDeduplicationAgent.execute({
    properties: searchResult.data.properties
  });

  const dedupedProps = dedupResult.success && dedupResult.data
    ? dedupResult.data.deduplicatedProperties
    : searchResult.data.properties;

  // 3. Rate Comparison
  const compResult = await rateComparisonAgent.execute({
    properties: dedupedProps,
    targetCurrency: input.currency || 'INR'
  });

  const finalProperties = compResult.success && compResult.data
    ? compResult.data.analyzedProperties
    : dedupedProps;

  return {
    success: true,
    data: {
      properties: finalProperties,
      totalFound: finalProperties.length,
      destination: searchResult.data.destination,
      checkInDate: searchResult.data.checkInDate,
      checkOutDate: searchResult.data.checkOutDate,
      searchId: searchResult.data.searchId,
      deduplicationStats: dedupResult.data,
      rateComparisonStats: compResult.data
    },
    stage: 'PipelineComplete',
    agentName: 'RTAIP_LodgingPipelineOrchestrator',
    executionTimeMs: (searchResult.executionTimeMs || 0) + (dedupResult.executionTimeMs || 0) + (compResult.executionTimeMs || 0)
  };
}

// Re-export underlying travelportService for backwards compatibility
export { travelportService };
export * from './rtaip/index.js';
