module.exports = (number, type) => {
  const patterns = {
    'batting': {
      1: [1, 4],
      2: [3, 5],
      3: [2, 4],
      4: [1, 6, 2],
      5: [3, 5, 4],
      6: [2, 3, 1],
    },
    'bowling': {
      1:[5, 6],
      2:[3, 2],
      3:[5, 1],
      4:[4, 6, 1],
      5:[2, 5, 3],
      6:[6, 1, 3],
    },
  };
  
  const random = Math.random();
  
  if (random < 0.85) {
    return (pattern[type]) [number];
  } else {
    return ((pattern[type]) [number + 1]) || ((pattern[type]) [number - 1]);
  }
}