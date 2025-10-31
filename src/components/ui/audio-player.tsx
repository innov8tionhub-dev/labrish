import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Pause, Play, Settings } from "lucide-react";

export interface AudioPlayerItem<TData = unknown> {
  id: string | number;
  src: string;
  data?: TData;
}

interface AudioPlayerContextValue<TData = unknown> {
  ref: React.RefObject<HTMLAudioElement>;
  activeItem: AudioPlayerItem<TData> | null;
  duration: number;
  error: MediaError | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackRate: number;
  isItemActive: (item: AudioPlayerItem<TData>) => boolean;
  setActiveItem: (item: AudioPlayerItem<TData>) => void;
  play: (item?: AudioPlayerItem<TData>) => void;
  pause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const AudioPlayerContext = React.createContext<
  AudioPlayerContextValue | undefined
>(undefined);

export function useAudioPlayer<TData = unknown>() {
  const context = React.useContext(
    AudioPlayerContext
  ) as AudioPlayerContextValue<TData>;
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}

export function useAudioPlayerTime() {
  const { ref } = useAudioPlayer();
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    let rafId: number;

    const updateTime = () => {
      if (ref.current) {
        setTime(ref.current.currentTime);
      }
      rafId = requestAnimationFrame(updateTime);
    };

    rafId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [ref]);

  return time;
}

export function AudioPlayerProvider<TData = unknown>({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLAudioElement>(null);
  const [activeItem, setActiveItem] = React.useState<AudioPlayerItem<TData> | null>(null);
  const [duration, setDuration] = React.useState(0);
  const [error, setError] = React.useState<MediaError | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const [playbackRate, setPlaybackRateState] = React.useState(1);

  const isItemActive = React.useCallback(
    (item: AudioPlayerItem<TData>) => {
      return activeItem?.id === item.id;
    },
    [activeItem]
  );

  const play = React.useCallback(
    (item?: AudioPlayerItem<TData>) => {
      if (item) {
        setActiveItem(item);
      } else if (ref.current) {
        ref.current.play();
      }
    },
    []
  );

  const pause = React.useCallback(() => {
    if (ref.current) {
      ref.current.pause();
    }
  }, []);

  const seek = React.useCallback((time: number) => {
    if (ref.current) {
      ref.current.currentTime = time;
    }
  }, []);

  const setPlaybackRate = React.useCallback((rate: number) => {
    if (ref.current) {
      ref.current.playbackRate = rate;
      setPlaybackRateState(rate);
    }
  }, []);

  React.useEffect(() => {
    const audio = ref.current;
    if (!audio || !activeItem) return;

    audio.src = activeItem.src;
    audio.playbackRate = playbackRate;
    audio.play();

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => setError(audio.error);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [activeItem, playbackRate]);

  const value: AudioPlayerContextValue<TData> = {
    ref,
    activeItem,
    duration,
    error,
    isPlaying,
    isBuffering,
    playbackRate,
    isItemActive,
    setActiveItem,
    play,
    pause,
    seek,
    setPlaybackRate,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio ref={ref} />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export interface AudioPlayerButtonProps<TData = unknown>
  extends Omit<ButtonProps, "onClick"> {
  item?: AudioPlayerItem<TData>;
}

export function AudioPlayerButton<TData = unknown>({
  item,
  className,
  ...props
}: AudioPlayerButtonProps<TData>) {
  const { play, pause, isPlaying, isBuffering, isItemActive } = useAudioPlayer<TData>();

  const handleClick = () => {
    if (item) {
      if (isItemActive(item) && isPlaying) {
        pause();
      } else {
        play(item);
      }
    } else {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }
  };

  const active = item ? isItemActive(item) : true;
  const playing = active && isPlaying;
  const buffering = active && isBuffering;

  return (
    <Button
      size="icon"
      onClick={handleClick}
      className={cn(
        "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white",
        className
      )}
      {...props}
    >
      {buffering ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : playing ? (
        <Pause className="h-4 w-4" fill="currentColor" />
      ) : (
        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
      )}
    </Button>
  );
}

export interface AudioPlayerProgressProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "min" | "max" | "value" | "onValueChange"
  > {}

export function AudioPlayerProgress({
  className,
  ...props
}: AudioPlayerProgressProps) {
  const { ref, duration, seek } = useAudioPlayer();
  const time = useAudioPlayerTime();
  const [isSeeking, setIsSeeking] = React.useState(false);
  const wasPlayingRef = React.useRef(false);

  const handleValueChange = (value: number[]) => {
    if (ref.current) {
      ref.current.currentTime = value[0];
    }
  };

  const handleValueCommit = (value: number[]) => {
    setIsSeeking(false);
    seek(value[0]);
    if (wasPlayingRef.current && ref.current) {
      ref.current.play();
    }
  };

  const handlePointerDown = () => {
    setIsSeeking(true);
    if (ref.current && !ref.current.paused) {
      wasPlayingRef.current = true;
      ref.current.pause();
    }
  };

  return (
    <SliderPrimitive.Root
      min={0}
      max={duration || 100}
      value={[isSeeking ? time : time]}
      onValueChange={handleValueChange}
      onValueCommit={handleValueCommit}
      onPointerDown={handlePointerDown}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-emerald-100">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-emerald-500 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}

export function AudioPlayerTime({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const time = useAudioPlayerTime();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <span className={cn("text-sm text-gray-600 tabular-nums", className)} {...props}>
      {formatTime(time)}
    </span>
  );
}

export function AudioPlayerDuration({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { duration } = useAudioPlayer();

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <span className={cn("text-sm text-gray-600 tabular-nums", className)} {...props}>
      {formatTime(duration)}
    </span>
  );
}

export interface AudioPlayerSpeedProps extends Omit<ButtonProps, "onClick"> {
  speeds?: readonly number[];
}

export function AudioPlayerSpeed({
  speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const,
  variant = "ghost",
  size = "icon",
  className,
  ...props
}: AudioPlayerSpeedProps) {
  const { playbackRate, setPlaybackRate } = useAudioPlayer();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={cn("text-gray-600 hover:text-emerald-600", className)}
        {...props}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[120px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <div className="space-y-1">
              {speeds.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={cn(
                    "w-full rounded px-3 py-2 text-left text-sm transition-colors",
                    playbackRate === speed
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {speed === 1 ? "Normal" : `${speed}x`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export interface AudioPlayerSpeedButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  speeds?: readonly number[];
}

export function AudioPlayerSpeedButtonGroup({
  speeds = [0.5, 1, 1.5, 2] as const,
  className,
  ...props
}: AudioPlayerSpeedButtonGroupProps) {
  const { playbackRate, setPlaybackRate } = useAudioPlayer();

  return (
    <div
      className={cn("inline-flex gap-1 rounded-lg border border-gray-200 p-1", className)}
      {...props}
    >
      {speeds.map((speed) => (
        <Button
          key={speed}
          size="sm"
          variant={playbackRate === speed ? "default" : "ghost"}
          onClick={() => setPlaybackRate(speed)}
          className={cn(
            "text-xs font-medium",
            playbackRate === speed
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
              : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
          )}
        >
          {speed === 1 ? "1x" : `${speed}x`}
        </Button>
      ))}
    </div>
  );
}
