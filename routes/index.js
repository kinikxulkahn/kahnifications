import express from 'express';
import { URI } from '../lib/Constants.js';
import TwitchClient from '../lib/TwitchClient.js';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const twitchClient = new TwitchClient();
  const authorizeUri = twitchClient.getAuthorizeUri(`${URI.NGROK_MAIN}/stream`);
  console.log(authorizeUri);
  res.render('index', { authorizeUri });
});

export default router;
