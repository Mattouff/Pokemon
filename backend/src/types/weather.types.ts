export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  description: string;
  location: string;
}

export enum WeatherCondition {
  CLEAR = 'clear',
  RAIN = 'rain',
  SNOW = 'snow',
  CLOUDS = 'clouds',
  THUNDERSTORM = 'thunderstorm',
  DRIZZLE = 'drizzle',
  UNKNOWN = 'unknown',
}

export interface WeatherEffect {
  condition: WeatherCondition;
  buffedTypes: string[];
  nerfedTypes: string[];
  damageMultiplier: number;
}

export interface OpenWeatherResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
  };
  name: string;
}
