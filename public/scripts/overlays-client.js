'use strict';

const collections = ['prayers', 'emotes'];
const endpoint = '/overlays/updates';
const client = new PollClient(collections.map(c => `${endpoint}?c=${c}`), 3000);
const emotes = new Emotes();
const prayers = new Prayers();

let abort_timer;

async function remove(msg) {
  let resp;

  const abort_timeout = 5000;

  if (abort_timer) clearTimeout(abort_timer);

  const controller = new AbortController();
  const signal = controller.signal;

  abort_timer = setTimeout(() => {
    controller.abort();
    console.error('PollClient::wait', 'Request timed out', this);
  }, abort_timeout);

  try {
    resp = await fetch(endpoint, {
      signal,
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: msg._id,
        collection: `${msg.type}s` // pluralized for db
      })
    });
  }catch(e) {
    console.error(e);
  }
}

window.addEventListener('PollClient::message', (e) => {
  const message = e.detail.message;
  if (message && message.data && message.data instanceof Array) {
    message.data.forEach(m => {
      let _destroy = true;
      switch(m.type) {
        case 'emote':
          emotes.launch(`<img src="https://static-cdn.jtvnw.net/emoticons/v1/${m.id}/2.0" />`);
          break;
        case 'prayer':
          prayers.launch(m.chars);    
          break;     
        default:
          _destroy = false; 
      }
      if (_destroy) remove(m);
    });
  }
});

try {
  client.waitAll();
}catch(e) {
  console.error(e);
}