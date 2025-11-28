import { z } from 'zod';

export const sendFriendRequestSchema = z.object({
  friend_username: z.string().min(1, 'Le nom d\'utilisateur est requis'),
});

export const updateFriendshipSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'blocked'], {
    errorMap: () => ({ message: 'Statut invalide' }),
  }),
});

export const createBattleSchema = z.object({
  opponent_id: z.number().int().nonnegative('L\'ID de l\'adversaire doit être un entier positif ou 0 pour l\'IA'),
});
