import axios from 'axios';
import config from '../config';
import { Pokemon, PokemonListResponse, PokeAPIResponse, PokemonStats, PokemonListItem } from '../types/pokemon.types';
import { NotFoundError } from '../types/errors.types';

class PokemonCache {
  private cache: Map<number, { data: Pokemon; timestamp: number }> = new Map();
  private TTL = 3600000;

  get(id: number): Pokemon | null {
    const cached = this.cache.get(id);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(id);
      return null;
    }
    
    return cached.data;
  }

  set(id: number, data: Pokemon): void {
    this.cache.set(id, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new PokemonCache();

export class PokeAPIService {
  private static baseURL = config.apis.pokeapi;

  static async getPokemon(id: number): Promise<Pokemon> {
    const cached = cache.get(id);
    if (cached) return cached;

    try {
      const response = await axios.get<PokeAPIResponse>(`${this.baseURL}/pokemon/${id}`);
      const pokemon = this.transformPokemon(response.data);
      cache.set(id, pokemon);
      return pokemon;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError(`Pokémon avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  static async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    try {
      const response = await axios.get<PokemonListResponse>(
        `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async searchPokemon(name: string): Promise<Pokemon> {
    try {
      const response = await axios.get<PokeAPIResponse>(`${this.baseURL}/pokemon/${name.toLowerCase()}`);
      return this.transformPokemon(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError(`Pokémon "${name}" introuvable`);
      }
      throw error;
    }
  }

  static async searchPokemons(query: string): Promise<Pokemon[]> {
    try {
      const response = await axios.get<PokemonListResponse>(
        `${this.baseURL}/pokemon?limit=1000&offset=0`
      );
      
      const filtered = response.data.results.filter(p => {
        const pokemonId = p.url.split('/').filter(Boolean).pop();
        return p.name.includes(query.toLowerCase()) || pokemonId === query;
      });

      const limited = filtered.slice(0, 20);

      const pokemons = await Promise.all(
        limited.map(async (p) => {
          const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0');
          return this.getPokemon(id);
        })
      );

      return pokemons;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPokemonExists(id: number): Promise<boolean> {
    try {
      await this.getPokemon(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getPokemonWithMoves(id: number): Promise<Pokemon> {
    try {
      const response = await axios.get<PokeAPIResponse>(`${this.baseURL}/pokemon/${id}`);
      const pokemon = this.transformPokemon(response.data);
      
      const moves = await this.getRandomMoves(response.data.moves, 4);
      pokemon.moves = moves;
      
      return pokemon;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundError(`Pokémon avec l'ID ${id} introuvable`);
      }
      throw error;
    }
  }

  private static async getRandomMoves(
    moveList: Array<{ 
      move: { name: string; url: string };
      version_group_details: Array<{
        level_learned_at: number;
        move_learn_method: { name: string };
      }>;
    }>,
    count: number
  ): Promise<any[]> {
    const levelUpMoves = moveList.filter(m => 
      m.version_group_details.some(vg => 
        vg.move_learn_method.name === 'level-up' && vg.level_learned_at <= 50
      )
    );
    
    if (levelUpMoves.length === 0) {
      console.warn('Aucune attaque trouvée, utilisation de toutes les attaques');
      return this.getFallbackMoves(moveList, count);
    }
    
    const selected = [];
    const available = [...levelUpMoves];
    
    let attempts = 0;
    const maxAttempts = levelUpMoves.length * 2;
    
    while (selected.length < count && available.length > 0 && attempts < maxAttempts) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * available.length);
      const move = available.splice(randomIndex, 1)[0];
      
      try {
        const moveResponse = await axios.get(move.move.url);
        const moveData = moveResponse.data;
        
        if (moveData.power && moveData.power > 0) {
          selected.push({
            name: moveData.name,
            type: moveData.type.name,
            power: moveData.power,
            accuracy: moveData.accuracy || 100,
            pp: moveData.pp
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de ${move.move.name}`);
      }
    }
    
    if (selected.length < count) {
      console.warn(`Seulement ${selected.length} attaques trouvées, ajout d'attaques supplémentaires`);
      const fallback = await this.getFallbackMoves(moveList, count - selected.length);
      selected.push(...fallback);
    }
    
    return selected.slice(0, count);
  }

  private static async getFallbackMoves(
    moveList: Array<{ move: { name: string; url: string } }>,
    count: number
  ): Promise<any[]> {
    const selected = [];
    const available = [...moveList];
    
    for (let i = 0; i < Math.min(count, available.length); i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const move = available.splice(randomIndex, 1)[0];
      
      try {
        const moveResponse = await axios.get(move.move.url);
        const moveData = moveResponse.data;
        
        if (moveData.power && moveData.power > 0) {
          selected.push({
            name: moveData.name,
            type: moveData.type.name,
            power: moveData.power,
            accuracy: moveData.accuracy || 100,
            pp: moveData.pp
          });
        } else {
          i--;
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de ${move.move.name}`);
        i--;
      }
    }
    
    return selected;
  }

  private static transformPokemon(data: PokeAPIResponse): Pokemon {
    const stats: PokemonStats = {
      hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 0,
      attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 0,
      defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 0,
      specialAttack: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0,
      specialDefense: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 0,
      speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 0,
    };

    return {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.front_default,
      stats,
      height: data.height,
      weight: data.weight,
    };
  }
}
