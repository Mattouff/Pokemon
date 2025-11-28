import { Router } from 'express';
import { WeatherService } from '../services/weather.service';

const router = Router();

router.get('/current', async (req, res, next) => {
  try {
    const city = (req.query.city as string) || 'Paris';
    const weather = await WeatherService.getCurrentWeather(city);

    res.status(200).json({
      success: true,
      data: weather,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/effects', async (req, res, next) => {
  try {
    const city = (req.query.city as string) || 'Paris';
    const weather = await WeatherService.getCurrentWeather(city);
    const effects = WeatherService.getWeatherEffects(weather.condition);

    res.status(200).json({
      success: true,
      data: {
        weather: {
          condition: weather.condition,
          description: weather.description,
          temperature: weather.temperature,
          location: weather.location,
        },
        effects: {
          buffed_types: effects.buffedTypes,
          nerfed_types: effects.nerfedTypes,
          multiplier: effects.multiplier,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
