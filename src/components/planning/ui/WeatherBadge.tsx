import React from "react";

interface WeatherBadgeProps {
  forecast: {
    condition: string;
    temperatureMin: number;
    temperatureMax: number;
    precipitationChance: number;
  };
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  forecast
}) => {
  if (!forecast) {
    return null;
  }

  // Weather condition to icon mapping
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return '☀️';
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return '☁️';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
    if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard')) return '❄️';
    if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return '🌫️';
    if (lowerCondition.includes('wind')) return '💨';
    return '🌡️'; // default
  };

  const icon = getWeatherIcon(forecast.condition);

  // Determine background color based on temperature
  const avgTemp = (forecast.temperatureMin + forecast.temperatureMax) / 2;
  let bgColor = 'bg-rose-50'; // default cool

  if (avgTemp >= 30) bgColor = 'bg-red-50'; // hot
  else if (avgTemp >= 25) bgColor = 'bg-orange-50'; // warm
  else if (avgTemp >= 20) bgColor = 'bg-pink-50'; // mild
  else bgColor = 'bg-rose-50'; // cool

  return (
    <div className={`p-3 rounded-lg border ${bgColor}`}>
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="font-medium text-gray-800">{forecast.condition}</p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold">{forecast.temperatureMin}°</span>
            <span> - </span>
            <span className="font-semibold">{forecast.temperatureMax}°</span>
          </div>
          {forecast.precipitationChance > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {forecast.precipitationChance}% chance of precipitation
            </p>
          )}
        </div>
      </div>
    </div>
  );
};