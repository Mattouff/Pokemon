import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateData } from '../utils/validation.utils';

/**
 * Middleware de validation des données de la requête
 * @param schema - Le schéma Zod de validation
 * @param property - La propriété de la requête à valider ('body', 'query', 'params')
 */
export function validate(schema: z.ZodSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedData = validateData(schema, req[property]);
      req[property] = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
}
