const publicVapidKey = 'BFcXL3nOnk_RULCdpZujKKQKOYJfKPBOapKMr75l4_uK2sJMxVXFyL0rR3x7gxCYAZvnt8t-XWcXKcwmL_ZKV2Y';

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator) {
  console.log('Registering service worker');

  run().catch(error => console.error(error));
}

async function run() {
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker.
    register('/static/scripts/push-worker.js', {scope: '/'});
  console.log('Registered service worker');

  navigator.serviceWorker.addEventListener('message', ev => {
    console.log(ev);
    new Emotes().launch(ev.data.emote);
  });
  
  console.log('Registering push');
  const subscription = await registration.pushManager.
    subscribe({
      userVisibleOnly: true,
      // The `urlBase64ToUint8Array()` function is the same as in
      // https://gist.github.com/Klerith/80abd742d726dd587f4bd5d6a0ab26b6
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
  console.log('Registered push');

  console.log('Sending push');
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  });
  console.log('Sent push');
}