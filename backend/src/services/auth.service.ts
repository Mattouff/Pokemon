import { UserModel } from '../models/user.model';
import { RefreshTokenModel } from '../models/refreshToken.model';
import { RegisterDTO, LoginDTO, AuthTokens, UserPayload } from '../types/auth.types';
import { ConflictError, UnauthorizedError } from '../types/errors.types';
import { hashPassword, comparePassword } from '../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  calculateTokenExpiration,
} from '../utils/jwt.utils';
import config from '../config';

export class AuthService {
  static async register(data: RegisterDTO): Promise<AuthTokens> {
    const { username, email, password } = data;

    if (await UserModel.emailExists(email)) {
      throw new ConflictError('Cet email est déjà utilisé');
    }

    if (await UserModel.usernameExists(username)) {
      throw new ConflictError('Ce nom d\'utilisateur est déjà pris');
    }

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create(username, email, passwordHash);

    return this.generateTokensForUser(user);
  }

  static async login(data: LoginDTO): Promise<AuthTokens> {
    const { username, password } = data;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Nom d\'utilisateur ou mot de passe incorrect');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Ce compte est désactivé');
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Nom d\'utilisateur ou mot de passe incorrect');
    }

    return this.generateTokensForUser(user);
  }

  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await RefreshTokenModel.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token invalide ou révoqué');
    }

    if (new Date() > new Date(storedToken.expires_at)) {
      await RefreshTokenModel.revoke(refreshToken);
      throw new UnauthorizedError('Refresh token expiré');
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await UserModel.findById(payload.id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Utilisateur non trouvé ou désactivé');
    }

    await RefreshTokenModel.revoke(refreshToken);

    return this.generateTokensForUser(user);
  }

  static async logout(refreshToken: string): Promise<void> {
    await RefreshTokenModel.revoke(refreshToken);
  }

  static async logoutAll(userId: number): Promise<void> {
    await RefreshTokenModel.revokeAllForUser(userId);
  }

  private static async generateTokensForUser(user: any): Promise<AuthTokens> {
    const payload: UserPayload = UserModel.toPayload(user);

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const refreshTokenExpiry = calculateTokenExpiration(config.jwt.refreshExpiresIn);
    await RefreshTokenModel.create(user.id, refreshToken, refreshTokenExpiry);

    return {
      accessToken,
      refreshToken,
    };
  }
}
