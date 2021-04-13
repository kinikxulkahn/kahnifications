import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import Helpers from './lib/Helpers.js';
import Storage from './lib/Storage.js';

import indexRouter from './routes/index.js';
import obsRouter from './routes/obs.js';
import chatRouter from './routes/chat.js';
import usersRouter from './routes/users.js';
import streamRouter from './routes/stream.js';
import overlaysRouter from './routes/overlays.js';
import subscribeRouter from './routes/subscribe.js';

const app = express();
const storage = new Storage(true);

console.log('Storage mounted:', storage);

app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next) {
  res.setHeader('Service-Worker-Allowed', '/');
  next();
});
app.use('/static', express.static(path.join(Helpers.dirname, '../public')));

app.use('/', indexRouter);
app.use('/obs', obsRouter);
app.use('/chat', chatRouter);
app.use('/users', usersRouter);
app.use('/stream', streamRouter);
app.use('/overlays', overlaysRouter);
app.use('/subscribe', subscribeRouter);

export { app };
