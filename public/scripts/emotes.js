'use strict';

class Emotes {

  launch(emote) {
    floating({
      content: emote,
      number: 1,
      duration: Helpers.random(1, 5),
      repeat: 1,
      size: [1, 5]
    });
  }
  
}
