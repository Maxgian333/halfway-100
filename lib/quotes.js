export const QUOTES = [
  {
    text: 'Today is victory over yourself of yesterday; tomorrow is your victory over lesser men.',
    author: 'Miyamoto Musashi',
  },
  {
    text: 'Mastering others is strength. Mastering yourself is true power.',
    author: 'Lao Tzu',
  },
  {
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'Do nothing which is of no use.',
    author: 'Miyamoto Musashi',
  },
  {
    text: 'Victorious warriors win first and then go to war, while defeated warriors go to war first and then seek to win.',
    author: 'Sun Tzu',
  },
  {
    text: 'You have power over your mind, not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'Make the best use of what is in your power, and take the rest as it happens.',
    author: 'Epictetus',
  },
  {
    text: 'Let right deeds be thy motive, not the fruit which comes from them.',
    author: 'The Bhagavad Gita',
  },
  {
    text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.',
    author: 'Rumi',
  },
  {
    text: 'No man ever steps in the same river twice, for it is not the same river and he is not the same man.',
    author: 'Heraclitus',
  },
  {
    text: 'If you know the enemy and know yourself, you need not fear the result of a hundred battles.',
    author: 'Sun Tzu',
  },
  {
    text: 'It is better to conquer yourself than to win a thousand battles. Then the victory is yours.',
    author: 'The Dhammapada',
  },
  {
    text: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
  },
  {
    text: 'The man who moves a mountain begins by carrying away small stones.',
    author: 'Confucius',
  },
  {
    text: 'Waste no more time arguing about what a good man should be. Be one.',
    author: 'Marcus Aurelius',
  },
  {
    text: 'To know others is wisdom. To know oneself is enlightenment.',
    author: 'Lao Tzu',
  },
  {
    text: 'Think lightly of yourself and deeply of the world.',
    author: 'Miyamoto Musashi',
  },
  {
    text: 'A gem cannot be polished without friction, nor a man perfected without trials.',
    author: 'Seneca',
  },
  {
    text: 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I will meet you there.',
    author: 'Rumi',
  },
  {
    text: 'The cave you fear to enter holds the treasure you seek.',
    author: 'Joseph Campbell',
  },
  {
    text: 'What we plant in the soil of contemplation, we shall reap in the harvest of action.',
    author: 'Meister Eckhart',
  },
  {
    text: 'He suffers more than necessary who suffers before it is necessary.',
    author: 'Seneca',
  },
  {
    text: 'Be like water making its way through cracks. Water is fluid, soft, and yielding — but it will wear away rock.',
    author: 'Bruce Lee',
  },
  {
    text: 'First say to yourself what you would be; and then do what you have to do.',
    author: 'Epictetus',
  },
];

export function quoteForDate(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
