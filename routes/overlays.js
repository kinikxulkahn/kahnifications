import Storage from '../lib/Storage.js';
import express from 'express';

const router = express.Router();

/* GET emotes */
router.get('/emotes', function(req, res, next) {
  res.render('overlays/emotes', {});
});

router.get('/updates', function(req, res, next) {
  const storage = new Storage(true);
  console.log(req.query.c);
  storage.fetch(req.query.c, null, function(docs) {
    res.json({ data: docs || [] });
    next();
  });
});

router.post('/updates', function(req, res, next) {
  const storage = new Storage(true);
  storage.remove(req.body.collection, { _id: req.body.id });
  res.send('ok');
});

export default router;
