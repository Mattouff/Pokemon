import { Request, Response, NextFunction } from 'express';
import { FriendshipService } from '../services/friendship.service';
import { AuthRequest } from '../types/auth.types';
import { validateData } from '../utils/validation.utils';
import { sendFriendRequestSchema } from '../utils/friendship.validation';

export class FriendshipController {
  static async sendRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const data = validateData(sendFriendRequestSchema, req.body) as { friend_username: string };
      await FriendshipService.sendFriendRequest(user.id, data);

      res.status(201).json({
        success: true,
        message: 'Demande d\'ami envoyée',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const friends = await FriendshipService.getFriendsList(user.id);

      res.status(200).json({
        success: true,
        data: friends,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const requests = await FriendshipService.getPendingRequests(user.id);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const requests = await FriendshipService.getSentRequests(user.id);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const friendshipId = parseInt(req.params.id);
      await FriendshipService.acceptFriendRequest(user.id, friendshipId);

      res.status(200).json({
        success: true,
        message: 'Demande d\'ami acceptée',
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const friendshipId = parseInt(req.params.id);
      await FriendshipService.rejectFriendRequest(user.id, friendshipId);

      res.status(200).json({
        success: true,
        message: 'Demande d\'ami rejetée',
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFriend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const friendshipId = parseInt(req.params.id);
      await FriendshipService.removeFriend(user.id, friendshipId);

      res.status(200).json({
        success: true,
        message: 'Ami supprimé',
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({
          success: false,
          error: { message: 'Le paramètre "q" est requis' },
        });
        return;
      }

      const users = await FriendshipService.searchUsers(user.id, query);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFriendDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthRequest).user!;
      const friendId = parseInt(req.params.id);
      const friendDetail = await FriendshipService.getFriendDetail(user.id, friendId);

      res.status(200).json({
        success: true,
        data: friendDetail,
      });
    } catch (error) {
      next(error);
    }
  }
}
