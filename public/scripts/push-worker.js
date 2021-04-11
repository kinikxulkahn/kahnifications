console.log('Loaded service worker!');

self.addEventListener('push', ev => {
    const data = ev.data.json();

    self.clients.matchAll().then(function (clients) {
      clients.forEach(function(client){
        console.log('Got push', data);
        // Send a message to the client.
        client.postMessage(data);
      });
  }); 
  // try { 
  //   console.log(typeof(Emotes));
  //   new Emotes().launch("🙋");
  // }catch(e) {
  //   console.error(e);
  // }
  // self.registration.showNotification(data.title, {
  //   body: 'Hello, World!',
  //   icon: 'http://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png'
  // });
});