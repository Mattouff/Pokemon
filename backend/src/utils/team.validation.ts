import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
});

export const addPokemonSchema = z.object({
  pokemon_id: z.number().int().positive('L\'ID du Pokémon doit être un entier positif'),
  position: z.number().int().min(1).max(6, 'La position doit être entre 1 et 6'),
  nickname: z.string().max(50, 'Le surnom ne peut pas dépasser 50 caractères').optional(),
});
