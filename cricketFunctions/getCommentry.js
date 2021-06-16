module.exports = (ball, bat) => {
  
  const batting = {
    1: [
      'Defended for a single by the batsman.',
      'Struck away gently to the side.',
      'Small tap to the side and the ball runs away.',
    ],
    2: [
      'Smashed across the field, only a double.',
      'Slips past the fielder for a two.',
      'Gentle touch and the ball rolls off for a two',
    ],
    3: [
      'Ball struck with good force stopped just before the boundary.',
      'Flicked off to the distance for a three.',
      'Good timed shot, adds three to the score.',
    ],
    4: [
      'Powerful shot runs away for a boundary!',
      'Beautiful timing as the ball skips for a four.',
      'Fantastic technique the ball bounces to the boundary line.',
    ],
    5: [
      'Powerful strike and Off goes the ball.',
      'Wonderful drive away to the stands.',
      'Amazing timing and that\'s a five to the score.',
    ],
    6: [
      'Powerful shot resulting in a six.' ,
      'Perfect timing as the ball flies over the line.',
      'Amazing shot gives six to the score.',
    ],
    7: [
      'Helicopter shot!',
      'The batsman sweeped the ball to score seven',
    ],
    8: [
      'Fantabulous shot out of the lines',
      'Batsman blowed the ball to score eight',
    ],
    9: [
      'Straight Drive to score nine',
      'Perfect timing shot over the boundaries',
    ],
    10: [
      'The ball flew over the boundary to score 10',
      'Direct hit out of the stadium breaking records',
    ],
    'W': [
      `The ball hit directly the ${(['left', 'right', 'middle'])[Math.floor(Math.random() * 3)]} stump!`,
      'The fielder dives catches the ball and yea he caught!',
      'The ball edged the bat, and the wicket keeper catches it...',
    ],
  }
  
  const bowling = {
    1: [
      'A slow ball aimed at the pads.',
      'Pace of the ball taken off for a beautiful spin.',
      'A well targeted throw at the batsman.',
    ],
    2: [
      'A short ball with a good pace.',
      'Ball chucked at the batsman.',
      'Good one-bouncer.',
      'Googly spin!',
    ],
    3: [
      'A medium paced ball at the batsman.',
      'Great spin at the stumps.',
      'Yorker!',
    ],
    4: [
      'Bouncer at short length.',
      'Medium paced ball shot forward.',
      'Googly spin!',
      'Leg-Spin at long.',
    ],
    5: [
      'Ball deviates to the side.',
      'Fast paced Yorker.',
      'Quick throw at maximum speed.',
    ],
    6: [
      'Yorker!',
      'Well timed ball with good spin.',
      'Maximum force giving maximum speed , the ball zooms through the air.',
      'Bouncer aimed straight for the wicket.',
    ],
    7: [
      'Ball is striking fast...',
      'Ball is travelling lightning fast.',
      'Oop, Ball turned into fire.',
    ],
    8: [
      'Lightning ball swings right to the middle stump.',
      'Fiery Ball froze to ice after pitch.',
    ],
    9: [
      'The ball is invisible to the audience.',
      'The ball bounced with the greatest acceleration.',
    ],
    10: [
      'The pace of the ball broke the record.',
      'The fastest paced ball is coming.',
    ],
    'O': [
      'Overs Over!',
    ]
  }
  
  if(ball == 'O') return (bowling['O'])[0];
  const batArray = batting[bat];
  const ballArray = bowling[ball];
  const batCommentry = batArray [ Math.floor( Math.random() * batArray.length ) ];
  const ballCommentry = ballArray [ Math.floor( Math.random() * ballArray.length ) ];
  
  return ballCommentry + ' ' + batCommentry;
}