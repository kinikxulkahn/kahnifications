import express from 'express';
import OBSClient from '../lib/OBSClient.js';

const router = express.Router();

/* GET obs page. */
router.get('/', function(req, res, next) {
  const obs = new OBSClient();
  const connect = async () => {
    await obs.connect();
    obs.client
      .send('TriggerHotkeyBySequence', { 
        keyId: 'OBS_KEY_2'
      })
      .then(() => {
        res.render('index', { message: "HW" });
      })
      .catch(e => console.error(e));
  };
  connect();
});

export default router;
