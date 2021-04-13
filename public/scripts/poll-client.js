'use strict';

class PollClient {

  timers = {};
  endpoints = [];
  timeout = 10000;
  stagger = 500;

  constructor(endpoints, timeout) {
    if (timeout) this.timeout = timeout;
    this.endpoints = endpoints instanceof Array ? endpoints : typeof(endpoints) === 'string' ? [endpoints] : [];
    console.log(this.endpoints);
  }

  waitAll() {
    this.endpoints.forEach(ep => { 
      this.timers[ep] = {
        poll: null,
        abort: null
      };
      setTimeout(this.wait.bind(this, ep), this.stagger);
    });
  }
  
  async wait(endpoint) {
    let resp;

    if (this.timers[endpoint].poll) clearTimeout(this.timers[endpoint].poll);
    if (this.timers[endpoint].abort) clearTimeout(this.timers[endpoint].abort);

    const controller = new AbortController();
    const signal = controller.signal;

    this.timers[endpoint].abort = setTimeout(() => {
      controller.abort();
      if (this.timers[endpoint].poll) clearTimeout(this.timers[endpoint].poll);
      console.error('PollClient::wait', 'Request timed out', this);
    }, this.timeout - 10);

    try {
      resp = await fetch(endpoint, {
        signal,
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }catch(e) {
      this.timers[endpoint].poll = setTimeout(this.wait.bind(this, endpoint), this.timeout);
      return;
    }

    if (resp) {
      if (this.timers[endpoint].abort) clearTimeout(this.timers[endpoint].abort);
      const msg = await resp.json();
      if (msg.data) {
        window.dispatchEvent(new CustomEvent('PollClient::message', { detail: { message: msg }}));
      }
    }

    this.timers[endpoint].poll = setTimeout(this.wait.bind(this, endpoint), this.timeout);
  }

}