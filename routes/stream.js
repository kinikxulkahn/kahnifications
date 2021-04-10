import TwitchClient from '../lib/TwitchClient.js';
import express from 'express';

const router = express.Router();


/* Stream API */
router.get('/', async function(req, res, next) {
  console.log('/stream', req.query);
  const twitchClient = new TwitchClient('./store/tokens.json');
  const getToken = async () => {
    console.log('getToken');
    try {
      const apiClient = await twitchClient.init('authorize', req.query.code);
      const resp = await apiClient.isStreamLive('kinikxulkahn');
      console.log(resp.data);
      res.send(JSON.stringify(resp.data, null, 2));
    }catch(e){
      return next(e);
    } 
  }
  try { 
    await getToken();
  }catch(e) {
    return next(e);
  }
  //res.send('respond with a resource');
});


export default router;
