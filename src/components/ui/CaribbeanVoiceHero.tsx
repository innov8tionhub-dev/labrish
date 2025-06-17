import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Globe, Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

const AnimatedTextCycle: React.FC<AnimatedTextCycleProps> = ({
  words,
  interval = 3000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: { 
      y: -20,
      opacity: 0,
      filter: "blur(8px)"
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      y: 20,
      opacity: 0,
      filter: "blur(8px)",
      transition: { 
        duration: 0.3, 
        ease: "easeIn"
      }
    },
  };

  return (
    <span className="relative inline-block min-w-[200px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          className={cn("inline-block font-bold", className)}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ whiteSpace: "nowrap" }}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const CaribbeanVoiceHero: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [audioWaves, setAudioWaves] = useState<number[]>([]);

  // Generate audio wave animation data
  useEffect(() => {
    const generateWaves = () => {
      const waves = Array.from({ length: 20 }, () => Math.random() * 100 + 20);
      setAudioWaves(waves);
    };

    generateWaves();
    const interval = setInterval(generateWaves, 2000);
    return () => clearInterval(interval);
  }, []);

  const rotatingWords = [
    "Authentic Caribbean Voices",
    "Cultural Storytelling",
    "Real-Time AI Chat",
    "Heritage Preservation"
  ];

  const particles = Array.from({ length: 15 }).map((_, index) => (
    <motion.div
      key={index}
      className="absolute w-1 h-1 bg-primary/40 rounded-full"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay: index * 0.3,
        ease: "easeInOut",
      }}
    />
  ));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 bg-background">
      {/* Caribbean-inspired background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Animated wave pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
            fill="rgba(16, 185, 129, 0.1)"
            animate={{
              d: [
                "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z",
                "M0,80 C300,40 600,100 900,80 C1050,60 1150,100 1200,80 L1200,120 L0,120 Z",
                "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles}
      </div>

      {/* Main content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
        {/* Cultural icons */}
        <motion.div
          className="flex justify-center items-center gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="p-3 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Mic className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <motion.div
            className="p-3 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-400/30"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Volume2 className="w-6 h-6 text-teal-400" />
          </motion.div>
          <motion.div
            className="p-3 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Globe className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <motion.div
            className="p-3 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart className="w-6 h-6 text-green-400" />
          </motion.div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="block mb-2">Labrish</span>
          <AnimatedTextCycle
            words={rotatingWords}
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent"
            interval={3500}
          />
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Connect with AI voices that speak your language, tell your stories, and preserve the rich cultural heritage of the Caribbean. 
          From Jamaican Patois to Trinidadian Creole, experience authentic conversations that honor our roots.
        </motion.p>

        {/* Audio visualization */}
        <motion.div
          className="flex justify-center items-end gap-1 mb-8 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {audioWaves.map((height, index) => (
            <motion.div
              key={index}
              className="w-2 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
              style={{ height: `${height}%` }}
              animate={{
                height: [`${height}%`, `${Math.random() * 80 + 20}%`, `${height}%`]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Button
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.span
              className="relative z-10 flex items-center gap-2"
              whileHover={{ x: 2 }}
            >
              Start Chatting
              <motion.div
                animate={{ x: isHovered ? 3 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: isHovered ? "100%" : "-100%" }}
              transition={{ duration: 0.6 }}
            />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 px-8 py-6 text-lg font-semibold rounded-full backdrop-blur-sm"
          >
            Explore Stories
          </Button>
        </motion.div>

        {/* Cultural preservation message */}
        <motion.div
          className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-400/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-sm md:text-base text-muted-foreground">
            🌴 <strong className="text-emerald-400">Preserving Culture:</strong> Every conversation helps keep Caribbean languages and stories alive for future generations
          </p>
        </motion.div>
      </div>

      {/* Ambient glow effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-400/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </section>
  );
};

export default CaribbeanVoiceHero;