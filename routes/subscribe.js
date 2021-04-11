import TwitchChat from '../lib/TwitchChat.js';
import { KEYS } from '../lib/Constants.js';
import express from 'express';
import webpush from 'web-push';

const router = express.Router();

webpush.setVapidDetails('mailto:kinikxulkahn@gmail.com', KEYS.PUB_VAPID, KEYS.SECRET_VAPID);

const chat = new TwitchChat('kinikxulkahn');
chat.connect();

/* POST subscribe */
router.post('/', function(req, res, next) {
  const subscription = req.body;
  res.status(201).json({});

  console.log(req.body);
  chat.subscribe(req.body);
});

export default router;
