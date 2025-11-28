import { Router } from 'express';
import { FriendshipController } from '../controllers/friendship.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/requests', FriendshipController.sendRequest);
router.get('/', FriendshipController.getFriends);
router.get('/requests/pending', FriendshipController.getPendingRequests);
router.get('/requests/sent', FriendshipController.getSentRequests);
router.put('/requests/:id/accept', FriendshipController.acceptRequest);
router.put('/requests/:id/reject', FriendshipController.rejectRequest);
router.delete('/:id', FriendshipController.removeFriend);
router.get('/search', FriendshipController.searchUsers);
router.get('/:id/detail', FriendshipController.getFriendDetail);

export default router;
