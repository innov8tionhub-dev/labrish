import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Book, Users, MapPin, Clock, Sparkles, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConvAIWidget from './ConvAIWidget';

// Story data structure
interface StoryNode {
  id: string;
  title: string;
  description: string;
  setting: string;
  characters: string[];
  prompt: string;
  choices?: string[];
  nextNodes?: { [key: string]: string };
  isEnding?: boolean;
  mood: 'adventure' | 'mystery' | 'romance' | 'folklore' | 'comedy';
}

interface StoryState {
  currentNodeId: string;
  visitedNodes: string[];
  userChoices: string[];
  storyProgress: number;
}

// Caribbean story collection
const CARIBBEAN_STORIES: { [key: string]: StoryNode } = {
  // Anansi Story
  'anansi-start': {
    id: 'anansi-start',
    title: 'Anansi and the Golden Mango',
    description: 'A classic Caribbean folktale about the clever spider Anansi',
    setting: 'A lush Caribbean village with towering mango trees',
    characters: ['Anansi the Spider', 'Village Elder', 'Golden Mango Tree'],
    mood: 'folklore',
    prompt: `You are telling the story of Anansi and the Golden Mango. Start by setting the scene in a beautiful Caribbean village where there's a magical mango tree that bears golden fruit. Speak in a warm Caribbean accent and ask the listener what they think Anansi should do when he discovers the tree. Keep it engaging and interactive.`,
    choices: ['Climb the tree immediately', 'Ask the village elder for permission', 'Wait and observe first'],
    nextNodes: {
      'climb': 'anansi-climb',
      'ask': 'anansi-elder',
      'wait': 'anansi-observe'
    }
  },
  'anansi-climb': {
    id: 'anansi-climb',
    title: 'The Hasty Climb',
    description: 'Anansi decides to climb the golden mango tree',
    setting: 'High up in the magical mango tree',
    characters: ['Anansi', 'Tree Spirit'],
    mood: 'adventure',
    prompt: `Continue the Anansi story. He climbed the tree quickly but now the tree spirit appears! The spirit is not angry but wants to test Anansi's wisdom. Present the listener with the spirit's riddle and ask them to help Anansi solve it. Use Caribbean dialect and make it engaging.`,
    choices: ['Answer with cleverness', 'Answer with honesty', 'Ask for a hint'],
    nextNodes: {
      'clever': 'anansi-clever-end',
      'honest': 'anansi-honest-end',
      'hint': 'anansi-hint'
    }
  },
  'anansi-elder': {
    id: 'anansi-elder',
    title: 'Seeking Wisdom',
    description: 'Anansi approaches the village elder',
    setting: 'The elder\'s hut filled with herbs and wisdom',
    characters: ['Anansi', 'Village Elder', 'Village Children'],
    mood: 'folklore',
    prompt: `The village elder smiles at Anansi's respect. She tells him about the tree's history and offers him a choice: take one mango for himself, or share the tree's magic with the whole village. What should Anansi choose? Speak as the wise elder with a gentle Caribbean accent.`,
    choices: ['Take one mango', 'Share with village', 'Ask about the tree\'s history'],
    nextNodes: {
      'take': 'anansi-selfish-end',
      'share': 'anansi-generous-end',
      'history': 'anansi-history'
    }
  },
  'anansi-observe': {
    id: 'anansi-observe',
    title: 'The Patient Watcher',
    description: 'Anansi decides to observe the tree first',
    setting: 'Hidden in the bushes near the golden mango tree',
    characters: ['Anansi', 'Various Animals', 'Tree Guardian'],
    mood: 'mystery',
    prompt: `Anansi watches and sees different animals approach the tree. Some are turned away, others are welcomed. He notices a pattern. Help Anansi figure out what the tree wants from those who approach it. Use a mysterious but warm Caribbean voice.`,
    choices: ['The tree wants kindness', 'The tree wants courage', 'The tree wants wisdom'],
    nextNodes: {
      'kindness': 'anansi-kind-end',
      'courage': 'anansi-brave-end',
      'wisdom': 'anansi-wise-end'
    }
  },
  // Ending nodes
  'anansi-generous-end': {
    id: 'anansi-generous-end',
    title: 'The Generous Heart',
    description: 'Anansi chooses to share the tree\'s magic',
    setting: 'The village square during a celebration',
    characters: ['Anansi', 'All Villagers', 'Tree Spirit'],
    mood: 'folklore',
    prompt: `Conclude the story beautifully. Anansi's generous choice transforms the village. The tree spirit blesses everyone, and Anansi becomes a hero not through trickery, but through kindness. End with a moral about sharing and community. Use a warm, celebratory Caribbean voice.`,
    isEnding: true
  },
  'anansi-wise-end': {
    id: 'anansi-wise-end',
    title: 'The Wisdom of Patience',
    description: 'Anansi\'s patience reveals the tree\'s secret',
    setting: 'Under the golden mango tree at sunset',
    characters: ['Anansi', 'Tree Spirit', 'Village Elder'],
    mood: 'folklore',
    prompt: `End the story with Anansi learning that the tree rewards those who show wisdom and patience. The tree spirit grants him not just mangoes, but the gift of greater wisdom to share with others. Conclude with a lesson about patience and observation.`,
    isEnding: true
  }
};

// Pirate Adventure Story
const PIRATE_STORIES: { [key: string]: StoryNode } = {
  'pirate-start': {
    id: 'pirate-start',
    title: 'The Lost Treasure of Port Royal',
    description: 'An adventure story set in historic Caribbean waters',
    setting: 'The bustling port of old Jamaica',
    characters: ['Captain Maya', 'First Mate Carlos', 'Mysterious Stranger'],
    mood: 'adventure',
    prompt: `Welcome to Port Royal in the golden age of Caribbean pirates! You are Captain Maya, and you've just received a mysterious map. The stranger who gave it to you disappeared into the crowd. What's your first move? Speak with a confident Caribbean pirate accent and make it exciting!`,
    choices: ['Study the map carefully', 'Ask around the tavern', 'Set sail immediately'],
    nextNodes: {
      'study': 'pirate-map',
      'tavern': 'pirate-tavern',
      'sail': 'pirate-hasty'
    }
  },
  'pirate-map': {
    id: 'pirate-map',
    title: 'Deciphering the Map',
    description: 'Captain Maya studies the mysterious treasure map',
    setting: 'Captain\'s quarters aboard the ship',
    characters: ['Captain Maya', 'First Mate Carlos', 'Ship\'s Navigator'],
    mood: 'mystery',
    prompt: `The map shows three possible locations: a hidden cove, an underwater cave, and a mountain peak. Each has different symbols. Your crew is ready for adventure! Which location calls to you? Use an adventurous Caribbean accent and build suspense.`,
    choices: ['The hidden cove', 'The underwater cave', 'The mountain peak'],
    nextNodes: {
      'cove': 'pirate-cove',
      'cave': 'pirate-cave',
      'mountain': 'pirate-mountain'
    }
  }
};

const ALL_STORIES = { ...CARIBBEAN_STORIES, ...PIRATE_STORIES };

const InteractiveStory: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [storyState, setStoryState] = useState<StoryState>({
    currentNodeId: '',
    visitedNodes: [],
    userChoices: [],
    storyProgress: 0
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);

  // Story selection options
  const storyOptions = [
    {
      id: 'anansi-start',
      title: 'Anansi and the Golden Mango',
      description: 'A classic Caribbean folktale about wisdom and generosity',
      mood: 'folklore' as const,
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'pirate-start',
      title: 'The Lost Treasure of Port Royal',
      description: 'An adventure on the high seas of the Caribbean',
      mood: 'adventure' as const,
      icon: <MapPin className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  // Initialize story
  const startStory = useCallback((storyId: string) => {
    const node = ALL_STORIES[storyId];
    if (node) {
      setSelectedStory(storyId);
      setCurrentNode(node);
      setStoryState({
        currentNodeId: storyId,
        visitedNodes: [storyId],
        userChoices: [],
        storyProgress: 0
      });
      setIsVoiceActive(true);
    }
  }, []);

  // Progress story based on choice
  const makeChoice = useCallback((choice: string) => {
    if (!currentNode || !currentNode.nextNodes) return;

    const nextNodeId = currentNode.nextNodes[choice];
    const nextNode = ALL_STORIES[nextNodeId];

    if (nextNode) {
      setCurrentNode(nextNode);
      setStoryState(prev => ({
        currentNodeId: nextNodeId,
        visitedNodes: [...prev.visitedNodes, nextNodeId],
        userChoices: [...prev.userChoices, choice],
        storyProgress: Math.min(prev.storyProgress + 20, 100)
      }));
    }
  }, [currentNode]);

  // Reset story
  const resetStory = useCallback(() => {
    setSelectedStory(null);
    setCurrentNode(null);
    setStoryState({
      currentNodeId: '',
      visitedNodes: [],
      userChoices: [],
      storyProgress: 0
    });
    setIsVoiceActive(false);
  }, []);

  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'folklore': return 'from-amber-500 to-orange-500';
      case 'adventure': return 'from-blue-500 to-cyan-500';
      case 'mystery': return 'from-purple-500 to-indigo-500';
      case 'romance': return 'from-pink-500 to-rose-500';
      case 'comedy': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (!selectedStory) {
    return (
      <section className="py-16 bg-gradient-to-br from-caribbean-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="font-heading text-4xl mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Interactive Caribbean Stories
            </motion.h2>
            <motion.p
              className="font-body text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Choose your adventure and experience immersive storytelling with authentic Caribbean voices
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {storyOptions.map((story, index) => (
              <motion.div
                key={story.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                onClick={() => startStory(story.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${story.color} rounded-full flex items-center justify-center text-white mb-6 mx-auto`}>
                  {story.icon}
                </div>
                <h3 className="font-heading text-2xl mb-3 text-gray-800 text-center">{story.title}</h3>
                <p className="font-body text-gray-600 text-center mb-6">{story.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {story.mood}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    5-10 min
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-caribbean-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Story Header */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-3xl text-gray-800 mb-2">{currentNode?.title}</h2>
                <p className="font-body text-gray-600">{currentNode?.description}</p>
              </div>
              <Button
                onClick={resetStory}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Story
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Story Progress</span>
                <span className="text-sm text-gray-500">{storyState.storyProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${getMoodColor(currentNode?.mood || 'folklore')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${storyState.storyProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Story Info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{currentNode?.setting}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">{currentNode?.characters.join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm capitalize">{currentNode?.mood}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Voice Chat */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Volume2 className="w-6 h-6 text-caribbean-600" />
                <h3 className="font-heading text-xl text-gray-800">Story Voice</h3>
              </div>

              {isVoiceActive ? (
                <div className="space-y-4">
                  <ConvAIWidget
                    agentId="agent_01jyd8m2mfedx8z5d030pp2nx0"
                    className="min-h-[400px] w-full border border-caribbean-200 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 text-center">
                    The AI narrator is ready to tell your story. Speak naturally to interact!
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Volume2 className="w-16 h-16 text-caribbean-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">Voice chat will start when you begin the story</p>
                </div>
              )}
            </motion.div>

            {/* Story Choices */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-caribbean-200/50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-heading text-xl text-gray-800 mb-6">Your Choices</h3>

              {currentNode?.choices && !currentNode.isEnding ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    What should happen next in the story? Choose your path:
                  </p>
                  {currentNode.choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      className={`w-full p-4 text-left rounded-lg border-2 border-caribbean-200 hover:border-caribbean-400 hover:bg-caribbean-50 transition-all duration-200 bg-gradient-to-r ${getMoodColor(currentNode.mood)} bg-opacity-5`}
                      onClick={() => makeChoice(Object.keys(currentNode.nextNodes!)[index])}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="font-medium text-gray-800">{choice}</span>
                    </motion.button>
                  ))}
                </div>
              ) : currentNode?.isEnding ? (
                <div className="text-center py-8">
                  <Sparkles className="w-16 h-16 text-caribbean-500 mx-auto mb-4" />
                  <h4 className="font-heading text-xl text-gray-800 mb-4">Story Complete!</h4>
                  <p className="text-gray-600 mb-6">
                    Thank you for experiencing this Caribbean tale. The story has reached its conclusion.
                  </p>
                  <Button
                    onClick={resetStory}
                    className="bg-gradient-to-r from-caribbean-500 to-teal-500 hover:from-caribbean-600 hover:to-teal-600"
                  >
                    Start New Story
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="w-16 h-16 text-caribbean-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Listen to the narrator and respond naturally to continue the story...
                  </p>
                </div>
              )}

              {/* Story History */}
              {storyState.visitedNodes.length > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-heading text-lg text-gray-800 mb-3">Your Journey</h4>
                  <div className="space-y-2">
                    {storyState.userChoices.map((choice, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-2 h-2 bg-caribbean-400 rounded-full"></div>
                        {choice}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveStory;