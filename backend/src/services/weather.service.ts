import axios from 'axios';
import config from '../config';
import { WeatherData, WeatherCondition, OpenWeatherResponse } from '../types/weather.types';

export class WeatherService {
  private static baseURL = config.apis.weatherApiUrl;
  private static apiKey = config.apis.weatherApiKey;

  static async getCurrentWeather(city: string = 'Paris'): Promise<WeatherData> {
    if (!this.apiKey) {
      console.warn('WEATHER_API_KEY non configurée, utilisation de la météo par défaut');
      return this.getDefaultWeather();
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(
        `${this.baseURL}/weather`,
        {
          params: {
            q: city,
            appid: this.apiKey,
            units: 'metric',
            lang: 'fr',
          },
        }
      );

      return this.transformWeatherData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      return this.getDefaultWeather();
    }
  }

  static async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    if (!this.apiKey) {
      return this.getDefaultWeather();
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(
        `${this.baseURL}/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.apiKey,
            units: 'metric',
            lang: 'fr',
          },
        }
      );

      return this.transformWeatherData(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la météo:', error);
      return this.getDefaultWeather();
    }
  }

  private static transformWeatherData(data: OpenWeatherResponse): WeatherData {
    const weatherMain = data.weather[0]?.main.toLowerCase() || 'unknown';
    const condition = this.mapWeatherCondition(weatherMain);

    return {
      condition,
      temperature: Math.round(data.main.temp),
      description: data.weather[0]?.description || 'Conditions inconnues',
      location: data.name,
    };
  }

  private static mapWeatherCondition(weatherMain: string): WeatherCondition {
    const mapping: Record<string, WeatherCondition> = {
      clear: WeatherCondition.CLEAR,
      rain: WeatherCondition.RAIN,
      snow: WeatherCondition.SNOW,
      clouds: WeatherCondition.CLOUDS,
      thunderstorm: WeatherCondition.THUNDERSTORM,
      drizzle: WeatherCondition.DRIZZLE,
    };

    return mapping[weatherMain] || WeatherCondition.UNKNOWN;
  }

  private static getDefaultWeather(): WeatherData {
    return {
      condition: WeatherCondition.CLEAR,
      temperature: 20,
      description: 'Ensoleillé',
      location: 'Inconnu',
    };
  }

  static getWeatherEffects(condition: WeatherCondition): { buffedTypes: string[]; nerfedTypes: string[]; multiplier: number } {
    const effects: Record<WeatherCondition, { buffedTypes: string[]; nerfedTypes: string[]; multiplier: number }> = {
      [WeatherCondition.RAIN]: {
        buffedTypes: ['water'],
        nerfedTypes: ['fire'],
        multiplier: 1.2, // +20% pour les types boostés, -20% pour les types affaiblis
      },
      [WeatherCondition.DRIZZLE]: {
        buffedTypes: ['water'],
        nerfedTypes: ['fire'],
        multiplier: 1.2,
      },
      [WeatherCondition.THUNDERSTORM]: {
        buffedTypes: ['water', 'electric'],
        nerfedTypes: ['fire'],
        multiplier: 1.2,
      },
      [WeatherCondition.CLEAR]: {
        buffedTypes: ['fire'],
        nerfedTypes: ['ice'],
        multiplier: 1.2,
      },
      [WeatherCondition.SNOW]: {
        buffedTypes: ['ice'],
        nerfedTypes: ['grass', 'ground'],
        multiplier: 1.2,
      },
      [WeatherCondition.CLOUDS]: {
        buffedTypes: [],
        nerfedTypes: [],
        multiplier: 1.0,
      },
      [WeatherCondition.UNKNOWN]: {
        buffedTypes: [],
        nerfedTypes: [],
        multiplier: 1.0,
      },
    };

    return effects[condition] || effects[WeatherCondition.UNKNOWN];
  }

  /**
   * Calcule le multiplicateur de dégâts en fonction de la météo et du type de Pokémon
   */
  static calculateWeatherMultiplier(weatherCondition: WeatherCondition, pokemonTypes: string[]): number {
    const effects = this.getWeatherEffects(weatherCondition);

    // Vérifier si un type du Pokémon est boosté
    const isBuffed = pokemonTypes.some(type => effects.buffedTypes.includes(type));
    if (isBuffed) {
      return effects.multiplier;
    }

    // Vérifier si un type du Pokémon est affaibli
    const isNerfed = pokemonTypes.some(type => effects.nerfedTypes.includes(type));
    if (isNerfed) {
      return 1 / effects.multiplier; // Inverse du multiplicateur
    }

    // Aucun effet
    return 1.0;
  }
}
