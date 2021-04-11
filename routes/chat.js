import TwitchChat from '../lib/TwitchChat.js';
import express from 'express';

const router = express.Router();

/* GET chat. */
router.get('/', function(req, res, next) {
  const chat = new TwitchChat('kinikxulkahn');
  const connect = async () => {
    await chat.connect(res);
    res.render('chat', {});
  };
  connect();
});

export default router;
