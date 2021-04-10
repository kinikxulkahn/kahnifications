import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import obsRouter from './routes/obs.js';
import chatRouter from './routes/chat.js';
import usersRouter from './routes/users.js';
import streamRouter from './routes/stream.js';

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/obs', obsRouter);
app.use('/chat', chatRouter);
app.use('/users', usersRouter);
app.use('/stream', streamRouter);

export { app };
