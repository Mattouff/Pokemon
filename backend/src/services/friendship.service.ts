import { FriendshipModel } from '../models/friendship.model';
import { UserModel } from '../models/user.model';
import { SendFriendRequestDTO, UpdateFriendshipDTO, FriendshipStatus, FriendWithDetails } from '../types/friendship.types';
import { ConflictError, NotFoundError, ValidationError } from '../types/errors.types';

export class FriendshipService {
  static async sendFriendRequest(userId: number, data: SendFriendRequestDTO): Promise<void> {
    const friend = await UserModel.findByUsername(data.friend_username);
    if (!friend) {
      throw new NotFoundError('Utilisateur introuvable');
    }

    if (friend.id === userId) {
      throw new ValidationError('Vous ne pouvez pas vous ajouter vous-même comme ami');
    }

    const existingFriendship = await FriendshipModel.findByUsers(userId, friend.id);
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new ConflictError('Impossible d\'ajouter cet utilisateur');
      }
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new ConflictError('Une demande d\'ami est déjà en attente');
      }
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictError('Vous êtes déjà amis');
      }
    }

    await FriendshipModel.create(userId, friend.id);
  }

  static async getFriendsList(userId: number): Promise<FriendWithDetails[]> {
    return await FriendshipModel.getFriends(userId, FriendshipStatus.ACCEPTED);
  }

  static async getPendingRequests(userId: number): Promise<FriendWithDetails[]> {
    return await FriendshipModel.getPendingRequests(userId);
  }

  static async getSentRequests(userId: number): Promise<FriendWithDetails[]> {
    return await FriendshipModel.getSentRequests(userId);
  }

  static async acceptFriendRequest(userId: number, friendshipId: number): Promise<void> {
    const friendship = await FriendshipModel.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError('Demande d\'ami introuvable');
    }

    // Vérifier que c'est bien l'utilisateur qui a reçu la demande
    if (friendship.friend_id !== userId) {
      throw new ValidationError('Vous ne pouvez accepter que les demandes qui vous sont adressées');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictError('Cette demande a déjà été traitée');
    }

    await FriendshipModel.updateStatus(friendshipId, FriendshipStatus.ACCEPTED);
  }

  static async rejectFriendRequest(userId: number, friendshipId: number): Promise<void> {
    const friendship = await FriendshipModel.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError('Demande d\'ami introuvable');
    }

    if (friendship.friend_id !== userId) {
      throw new ValidationError('Vous ne pouvez rejeter que les demandes qui vous sont adressées');
    }

    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictError('Cette demande a déjà été traitée');
    }

    await FriendshipModel.delete(friendshipId);
  }

  static async removeFriend(userId: number, friendshipId: number): Promise<void> {
    const friendship = await FriendshipModel.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError('Ami introuvable');
    }

    const isInvolved = await FriendshipModel.isInvolved(friendshipId, userId);
    if (!isInvolved) {
      throw new NotFoundError('Ami introuvable');
    }

    await FriendshipModel.delete(friendshipId);
  }

  static async searchUsers(userId: number, query: string): Promise<Array<{ 
    id: number; 
    username: string; 
    email: string;
    teams_count: number;
    total_battles: number;
    is_friend: boolean;
    request_sent: boolean;
  }>> {
    if (query.length < 2) {
      throw new ValidationError('La recherche doit contenir au moins 2 caractères');
    }

    const db = (await import('../config/database')).default;
    const searchQuery = `
      SELECT 
        u.id, 
        u.username, 
        u.email,
        COALESCE(t.teams_count, 0)::integer as teams_count,
        COALESCE(b.total_battles, 0)::integer as total_battles,
        CASE 
          WHEN f_accepted.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as is_friend,
        CASE 
          WHEN f_pending.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END as request_sent
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as teams_count
        FROM teams
        GROUP BY user_id
      ) t ON u.id = t.user_id
      LEFT JOIN (
        SELECT attacker_id as user_id, COUNT(*) as battle_count
        FROM battles
        GROUP BY attacker_id
        UNION ALL
        SELECT defender_id as user_id, COUNT(*) as battle_count
        FROM battles
        GROUP BY defender_id
      ) b_combined ON u.id = b_combined.user_id
      LEFT JOIN (
        SELECT user_id, SUM(battle_count)::integer as total_battles
        FROM (
          SELECT attacker_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY attacker_id
          UNION ALL
          SELECT defender_id as user_id, COUNT(*) as battle_count
          FROM battles
          GROUP BY defender_id
        ) battles_union
        GROUP BY user_id
      ) b ON u.id = b.user_id
      LEFT JOIN friendships f_accepted ON 
        ((f_accepted.user_id = $2 AND f_accepted.friend_id = u.id) OR 
         (f_accepted.friend_id = $2 AND f_accepted.user_id = u.id))
        AND f_accepted.status = 'accepted'
      LEFT JOIN friendships f_pending ON 
        (f_pending.user_id = $2 AND f_pending.friend_id = u.id)
        AND f_pending.status = 'pending'
      WHERE (u.username ILIKE $1 OR u.email ILIKE $1) 
        AND u.id != $2 
        AND u.is_active = TRUE
      LIMIT 10
    `;
    const result = await db.query(searchQuery, [`%${query}%`, userId]);
    return result.rows;
  }

  static async getFriendDetail(userId: number, friendId: number): Promise<any> {
    const friendship = await FriendshipModel.findByUsers(userId, friendId);
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new NotFoundError('Ami introuvable');
    }

    const db = (await import('../config/database')).default;

    const friendResult = await db.query(
      `SELECT 
        id, 
        username,
        CASE 
          WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN TRUE 
          ELSE FALSE 
        END as is_online
      FROM users 
      WHERE id = $1`,
      [friendId]
    );
    
    if (!friendResult.rows || friendResult.rows.length === 0) {
      throw new NotFoundError('Utilisateur introuvable');
    }
    
    const friend = friendResult.rows[0];

    const teamsResult = await db.query(
      'SELECT COUNT(*)::integer as teams_count FROM teams WHERE user_id = $1',
      [friendId]
    );
    const teams_count = teamsResult.rows[0]?.teams_count || 0;

    // Récupérer les statistiques de combat
    const statsResult = await db.query(
      `SELECT 
        COUNT(*)::integer as total_battles,
        SUM(CASE WHEN winner_id = $1 THEN 1 ELSE 0 END)::integer as wins,
        SUM(CASE WHEN winner_id IS NULL THEN 1 ELSE 0 END)::integer as draws,
        SUM(CASE WHEN winner_id IS NOT NULL AND winner_id != $1 THEN 1 ELSE 0 END)::integer as losses
      FROM battles
      WHERE attacker_id = $1 OR defender_id = $1`,
      [friendId]
    );
    const stats = {
      total_battles: statsResult.rows[0]?.total_battles || 0,
      wins: statsResult.rows[0]?.wins || 0,
      draws: statsResult.rows[0]?.draws || 0,
      losses: statsResult.rows[0]?.losses || 0
    };

    // Récupérer l'équipe active avec ses Pokémon
    const activeTeamResult = await db.query(
      `SELECT id, name FROM teams WHERE user_id = $1 AND is_active = TRUE`,
      [friendId]
    );

    let active_team = undefined;
    if (activeTeamResult.rows.length > 0) {
      const team = activeTeamResult.rows[0];
      
      // Récupérer les Pokémon de l'équipe active
      const pokemonsResult = await db.query(
        `SELECT id, pokemon_id, position, nickname 
         FROM team_pokemons 
         WHERE team_id = $1 
         ORDER BY position`,
        [team.id]
      );

      // Enrichir avec les données de PokeAPI
      const PokeAPIService = (await import('./pokeapi.service')).PokeAPIService;
      const pokemons = await Promise.all(
        pokemonsResult.rows.map(async (tp: any) => {
          const pokemonData = await PokeAPIService.getPokemon(tp.pokemon_id);
          return {
            id: tp.id,
            pokemon_id: tp.pokemon_id,
            name: pokemonData.name,
            sprite: pokemonData.sprite,
            types: pokemonData.types,
            position: tp.position,
            nickname: tp.nickname
          };
        })
      );

      active_team = {
        id: team.id,
        name: team.name,
        pokemons
      };
    }

    return {
      id: friend.id,
      username: friend.username,
      is_online: friend.is_online,
      teams_count,
      stats,
      active_team
    };
  }
}
