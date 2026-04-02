import React, { useEffect } from 'react';
import { useSEO } from '@/lib/seo';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
}

interface SEOPageProps {
  config: SEOConfig;
  children: React.ReactNode;
}

const SEOPage: React.FC<SEOPageProps> = ({ config, children }) => {
  const { updateSEO } = useSEO();

  useEffect(() => {
    updateSEO(config);
  }, [updateSEO, config]);

  return <>{children}</>;
};

export default SEOPage;
