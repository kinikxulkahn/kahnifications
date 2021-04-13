class Prayers {
  launch(chars) {
    if (!chars) return;
    const letters = chars.split('');
    letters.forEach(char => floating({
      content: char,
      number: 1,
      duration: Helpers.random(1, 5),
      repeat: 1,
      size: [1, 5]
    }));
  }
}