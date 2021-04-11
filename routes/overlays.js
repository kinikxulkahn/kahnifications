import TwitchChat from '../lib/TwitchChat.js';
import express from 'express';

const router = express.Router();

/* GET emotes */
router.get('/emotes', function(req, res, next) {
  res.render('overlays/emotes', {});
});

export default router;
