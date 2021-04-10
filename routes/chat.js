import TwitchChat from '../lib/TwitchChat.js';
import express from 'express';

const router = express.Router();

/* GET chat. */
router.get('/', function(req, res, next) {
  const chat = new TwitchChat('kinikxulkahn');
  const connect = async () => {
    await chat.connect();
    res.send('respond with a resource');
  };
  connect();
});

export default router;
