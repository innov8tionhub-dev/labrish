export interface StoryTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  voiceSuggestion?: string;
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'anansi-adventure',
    title: 'Anansi\'s Clever Trick',
    category: 'folklore',
    description: 'A classic Caribbean folktale featuring the clever spider Anansi',
    content: `Long ago, in a small Caribbean village, there lived a clever spider named Anansi. He was known throughout the land for his quick wit and cunning ways.

One day, Anansi heard about a contest. The village chief promised a great reward to anyone who could bring him the sound of silence. Anansi thought and thought about how he could win this prize.

He went to the marketplace at dawn when everyone was sleeping. He listened carefully to the gentle breeze and the distant waves. Then he had an idea.

Anansi returned to the chief and whispered, "I have brought you the sound of silence." The chief leaned in close to hear, and in that quiet moment, he understood. Anansi had won not with noise, but with wisdom.`,
    tags: ['anansi', 'folklore', 'wisdom', 'caribbean', 'children'],
    estimatedDuration: 90,
    difficulty: 'beginner',
    voiceSuggestion: 'Deep, storytelling voice with Caribbean accent'
  },
  {
    id: 'beach-meditation',
    title: 'Caribbean Sunset Meditation',
    category: 'meditation',
    description: 'A calming meditation inspired by Caribbean beaches',
    content: `Close your eyes and imagine yourself on a beautiful Caribbean beach. The warm sand beneath your feet, soft and inviting.

Feel the gentle sea breeze on your skin, carrying the scent of salt water and tropical flowers. Listen to the rhythmic sound of waves washing ashore... in and out... in and out.

The sun is setting, painting the sky in shades of orange, pink, and gold. Each wave that rolls in brings peace. Each wave that rolls out carries away your worries.

Breathe in the fresh ocean air. Hold it for a moment. Breathe out slowly. Let yourself be present in this moment of Caribbean tranquility.

You are calm. You are peaceful. You are exactly where you need to be.`,
    tags: ['meditation', 'relaxation', 'beach', 'wellness', 'peace'],
    estimatedDuration: 120,
    difficulty: 'beginner',
    voiceSuggestion: 'Soft, calming female voice'
  },
  {
    id: 'recipe-jerk-chicken',
    title: 'Authentic Jerk Chicken Recipe',
    category: 'educational',
    description: 'Step-by-step guide to making traditional Caribbean jerk chicken',
    content: `Welcome to Caribbean Cooking! Today we're making authentic jerk chicken, a beloved dish from Jamaica.

First, gather your ingredients: chicken pieces, scotch bonnet peppers, allspice berries, thyme, garlic, ginger, green onions, soy sauce, and lime juice.

Step one: Create the jerk marinade. Blend scotch bonnets, garlic, ginger, green onions, allspice, thyme, soy sauce, and lime juice until smooth. Be careful with those peppers - they're hot!

Step two: Score the chicken pieces and coat them generously with the marinade. Let it sit for at least four hours, or overnight for best results.

Step three: Grill over medium-high heat, turning occasionally. The chicken should be slightly charred on the outside and juicy inside.

Serve with rice and peas, festival, or fresh salad. Enjoy your taste of the Caribbean!`,
    tags: ['recipe', 'cooking', 'jerk', 'jamaican', 'food'],
    estimatedDuration: 150,
    difficulty: 'intermediate'
  },
  {
    id: 'carnival-history',
    title: 'The History of Caribbean Carnival',
    category: 'educational',
    description: 'Learn about the rich cultural history of Caribbean Carnival',
    content: `Caribbean Carnival is more than just a celebration - it's a vibrant expression of history, culture, and resistance.

The tradition has roots in the emancipation of enslaved Africans in the 1830s. When freedom came, people took to the streets in jubilant celebration, wearing elaborate costumes and playing music.

Today, Carnival celebrations happen across the Caribbean, each with unique flavors. Trinidad and Tobago's Carnival is known for soca music and massive street parties. Jamaica's Carnival brings dancehall to the streets. Barbados hosts Crop Over, celebrating the sugar cane harvest.

The costumes are works of art - feathers, beads, and sequins creating moving rainbows of color. The music is infectious - steel pan, soca, and calypso rhythms that make it impossible to stand still.

Carnival represents freedom, creativity, and the resilient spirit of Caribbean people. It's a time when everyone comes together to celebrate life, culture, and community.`,
    tags: ['carnival', 'history', 'culture', 'caribbean', 'celebration'],
    estimatedDuration: 180,
    difficulty: 'intermediate'
  },
  {
    id: 'bedtime-story',
    title: 'The Hummingbird\'s Gift',
    category: 'children',
    description: 'A gentle bedtime story about a kind hummingbird',
    content: `In a tropical garden filled with bright flowers, there lived a little hummingbird named Ruby. She had shimmering green feathers and loved to visit every flower she could find.

One morning, Ruby noticed that the old mango tree in the corner of the garden looked sad. Its leaves were drooping, and it hadn't bloomed in years.

"Don't worry, dear tree," Ruby chirped. "I'll help you feel better!" Every day, Ruby would visit the mango tree, telling it stories about the beautiful flowers she'd seen and the sweet nectar she'd tasted.

Slowly, the mango tree began to perk up. It started growing new leaves. Then one day, beautiful white blossoms appeared! The tree was happy again.

"Thank you, little Ruby," the tree whispered. "Your kind words gave me hope."

Ruby learned that sometimes, the smallest creatures can make the biggest difference with a little kindness.

Sweet dreams, little one.`,
    tags: ['bedtime', 'children', 'kindness', 'nature', 'animals'],
    estimatedDuration: 120,
    difficulty: 'beginner',
    voiceSuggestion: 'Warm, gentle storytelling voice'
  },
  {
    id: 'island-adventure',
    title: 'Mystery of the Hidden Cove',
    category: 'adventure',
    description: 'An exciting adventure story set in the Caribbean',
    content: `Twelve-year-old Maya had always loved exploring the beaches near her home in St. Lucia. But she'd never ventured to the mysterious cove her grandmother warned her about.

One sunny afternoon, curiosity got the better of her. She grabbed her snorkel and fins and headed to the forbidden cove. The water was crystal clear, revealing colorful fish and coral below.

As Maya swam deeper, she spotted something glinting in the sand. She dove down and found an old brass compass, covered in barnacles. When she cleaned it off, strange symbols appeared on its face.

The compass needle started spinning wildly, then pointed toward a dark underwater cave. Maya's heart raced with excitement and fear. Should she follow it?

Taking a deep breath, she swam into the cave. Inside, she discovered ancient carvings on the walls - the same symbols from the compass! They told the story of Caribbean pirates who had hidden treasure in these waters centuries ago.

Maya realized she'd stumbled upon a real historical mystery. She couldn't wait to tell her grandmother - and maybe, just maybe, solve the puzzle of the hidden treasure.`,
    tags: ['adventure', 'mystery', 'children', 'caribbean', 'treasure'],
    estimatedDuration: 180,
    difficulty: 'intermediate'
  },
  {
    id: 'proverb-wisdom',
    title: 'Caribbean Proverbs and Wisdom',
    category: 'folklore',
    description: 'Traditional Caribbean sayings and their meanings',
    content: `Caribbean proverbs carry the wisdom of generations, passed down through storytelling and everyday conversation. Let me share some with you.

"Every hoe have dem stick a bush." This means everyone has their own problems and challenges to face. No one's life is perfect.

"De higher de monkey climb, de more him expose." This reminds us that the more successful we become, the more people will scrutinize our actions.

"Cockroach nuh business inna fowl fight." Don't get involved in other people's arguments - mind your business!

"One han' can't clap." Teamwork is essential. We need each other to succeed.

"Wha' sweet nanny goat a go run him belly." If something seems too good to be true, it probably is. Be careful of temptation.

These sayings reflect Caribbean values: community, humility, wisdom, and knowing when to speak and when to stay quiet. They're more than just words - they're lessons for living well.`,
    tags: ['proverbs', 'wisdom', 'culture', 'folklore', 'education'],
    estimatedDuration: 150,
    difficulty: 'intermediate'
  },
  {
    id: 'business-podcast',
    title: 'Caribbean Entrepreneurship Intro',
    category: 'podcast',
    description: 'Professional podcast introduction template',
    content: `Welcome to Caribbean Business Voices, the podcast where we explore entrepreneurship, innovation, and success stories from across the islands.

I'm your host, and today we're diving deep into what it takes to build a thriving business in the Caribbean market. Whether you're just starting out or looking to scale your operation, this show is for you.

In each episode, we bring you insights from successful entrepreneurs, practical tips you can implement right away, and honest conversations about the challenges we face doing business in the region.

The Caribbean is more than beautiful beaches and tourism. It's a hub of creativity, innovation, and business opportunity. Our entrepreneurs are making waves globally, and we're here to tell their stories.

Before we jump into today's topic, let me remind you to subscribe and leave a review. It helps other Caribbean entrepreneurs find the show. Now, let's get into it.`,
    tags: ['podcast', 'business', 'entrepreneurship', 'professional', 'intro'],
    estimatedDuration: 90,
    difficulty: 'advanced',
    voiceSuggestion: 'Professional, energetic voice'
  },
  {
    id: 'tour-guide',
    title: 'Virtual Tour: Old San Juan',
    category: 'travel',
    description: 'A guided tour script for Caribbean destinations',
    content: `Welcome to Old San Juan, one of the Caribbean's most historic and colorful cities. As we walk these cobblestone streets, you're literally walking through five centuries of history.

Look at these buildings - their vibrant blues, yellows, and pinks aren't just for show. These pastel colors help reflect the intense Caribbean sun, keeping homes cool in the tropical heat.

To our left is El Morro, the fortress that protected San Juan from invaders for over 400 years. Its massive walls, some 18 feet thick, have witnessed countless battles and storms.

As we continue down this street, notice the beautiful wooden balconies. They were designed to create shade and allow air to flow through homes before air conditioning existed.

The aroma you're smelling? That's local coffee roasting nearby, mixed with the scent of tropical flowers. And listen - you can hear street musicians playing traditional bomba music in the square ahead.

Old San Juan is where history lives and breathes. Every corner tells a story, every building holds secrets from centuries past. Let's explore more.`,
    tags: ['tour', 'travel', 'history', 'puerto-rico', 'guide'],
    estimatedDuration: 120,
    difficulty: 'intermediate'
  }
];

export const getTemplatesByCategory = (category: string): StoryTemplate[] => {
  return STORY_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): StoryTemplate[] => {
  return STORY_TEMPLATES.filter(template => template.difficulty === difficulty);
};

export const searchTemplates = (query: string): StoryTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return STORY_TEMPLATES.filter(template =>
    template.title.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
