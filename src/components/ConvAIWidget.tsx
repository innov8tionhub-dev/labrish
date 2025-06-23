import React, { useEffect } from 'react';

interface ConvAIWidgetProps {
  agentId?: string;
  className?: string;
}

const ConvAIWidget: React.FC<ConvAIWidgetProps> = ({ 
  agentId = "agent_01jyd8m2mfedx8z5d030pp2nx0",
  className = ""
}) => {
  useEffect(() => {
    // Load the ElevenLabs ConvAI widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={className}>
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </div>
  );
};

export default ConvAIWidget;