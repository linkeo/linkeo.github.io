const ROCK = '石头';
const SCISSORS = '剪刀';
const PAPER = '布';
const shapes = [ROCK, SCISSORS, PAPER];
const compare = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (
    (a === ROCK && b === SCISSORS) ||
    (a === SCISSORS && b === PAPER) ||
    (a === PAPER && b === ROCK)
  ) {
    return 1;
  }
  return -1;
};

function winCaces(games = 1, stack = []) {
  if (games > 0) {
    let count = 0;
    for (const thisSide of shapes) {
      for (const thatSide of shapes) {
        count += winCaces(games - 1, [...stack, [thisSide, thatSide]]);
      }
    }
    return count;
  } else {
    const totalScore = stack
      .map(([thisSide, thatSide]) => compare(thisSide, thatSide))
      .reduce((sum, score) => sum + score, 0);
    if (totalScore > 0) {
      console.log(stack.map(pair => pair.join('vs')).join(', '));
      return 1;
    }
    return 0;
  }
}

const count = winCaces(3);
console.log('一共' + count + '种情况');
