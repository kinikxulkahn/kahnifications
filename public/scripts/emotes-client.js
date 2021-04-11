'use strict';

class Emotes {

  launch(emote) {
    floating({
      content: emote,
      number: 1,
      duration: 3,
      repeat: 1,
      size: 3
    });
  }
  
}
