import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Mic2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { errorHandler } from '@/lib/errorHandling';
import SectionHeader from '@/components/common/SectionHeader';
import { scaleIn, viewportOnce } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { cardSurface } from '@/lib/styles';

interface LiveStat {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const statValueClass =
  'font-heading text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 break-words leading-tight';

const statIconWrap =
  'w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center text-emerald-600';

const PartnersSection: React.FC = () => {
  const [storyCount, setStoryCount] = useState<number | null>(null);
  const [storytellerCount, setStorytellerCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      try {
        const [storiesRes, profilesRes] = await Promise.all([
          supabase
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('visibility', 'public'),
          supabase
            .from('creator_profiles')
            .select('*', { count: 'exact', head: true }),
        ]);

        if (cancelled) return;

        if (typeof storiesRes.count === 'number') setStoryCount(storiesRes.count);
        if (typeof profilesRes.count === 'number') setStorytellerCount(profilesRes.count);
      } catch (error) {
        errorHandler.logError(error as Error, { source: 'PartnersSection.loadCounts' });
      }
    };

    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = buildStats(storytellerCount, storyCount);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-caribbean-50/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Preserving Caribbean Culture,"
          highlight="One Story at a Time"
          subtitle="An honest, community-driven platform for Caribbean storytelling."
          className="max-w-2xl"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={`${stat.label}-${index}`}
              className={cn(cardSurface, 'text-center p-4 sm:p-6')}
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={statIconWrap}>{stat.icon}</div>
              <div className={statValueClass}>{stat.value}</div>
              <p className="text-xs sm:text-sm text-gray-600 font-body leading-snug">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const formatCount = (n: number | null): string | null => {
  if (n === null || n === 0) return null;
  if (n < 10) return String(n);
  if (n < 100) return `${Math.floor(n / 10) * 10}+`;
  if (n < 1000) return `${Math.floor(n / 100) * 100}+`;
  return `${Math.floor(n / 1000).toLocaleString()}k+`;
};

const buildStats = (
  storytellerCount: number | null,
  storyCount: number | null,
): LiveStat[] => {
  const stats: LiveStat[] = [];
  const storytellers = formatCount(storytellerCount);
  if (storytellers) {
    stats.push({
      icon: <Users className="w-6 h-6" aria-hidden="true" />,
      value: storytellers,
      label: 'Storytellers on the platform',
    });
  }

  const stories = formatCount(storyCount);
  if (stories) {
    stats.push({
      icon: <BookOpen className="w-6 h-6" aria-hidden="true" />,
      value: stories,
      label: 'Public stories shared',
    });
  }

  stats.push({
    icon: <Mic2 className="w-6 h-6" aria-hidden="true" />,
    value: 'Authentic',
    label: 'Caribbean voices and dialects',
  });

  stats.push({
    icon: <Sparkles className="w-6 h-6" aria-hidden="true" />,
    value: 'Culture-first',
    label: 'Built with the community, not for it',
  });

  return stats;
};

export default PartnersSection;
