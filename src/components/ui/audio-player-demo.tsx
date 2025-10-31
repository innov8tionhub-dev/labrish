import React from "react";
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
  AudioPlayerSpeed,
  AudioPlayerSpeedButtonGroup,
  AudioPlayerItem,
} from "@/components/ui/audio-player";
import { Volume2, Music } from "lucide-react";

const sampleTracks: AudioPlayerItem<{ title: string; artist: string }>[] = [
  {
    id: "1",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    data: {
      title: "Caribbean Sunset",
      artist: "Island Beats",
    },
  },
  {
    id: "2",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    data: {
      title: "Tropical Vibes",
      artist: "Steel Pan Collective",
    },
  },
  {
    id: "3",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    data: {
      title: "Island Rhythm",
      artist: "Calypso Kings",
    },
  },
];

export function AudioPlayerDemo() {
  return (
    <div className="w-full space-y-8 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-heading text-gray-800 flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-emerald-600" />
          Caribbean Audio Player
        </h2>
        <p className="text-sm text-gray-600">
          Experience our beautifully styled audio player with Caribbean colors
        </p>
      </div>

      <AudioPlayerProvider>
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Simple Player
            </h3>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <AudioPlayerButton />
                <div className="flex-1">
                  <AudioPlayerProgress />
                </div>
                <AudioPlayerTime />
                <span className="text-sm text-gray-400">/</span>
                <AudioPlayerDuration />
                <AudioPlayerSpeed />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-600" />
              Multiple Tracks
            </h3>
            <div className="space-y-3">
              {sampleTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <AudioPlayerButton item={track} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {track.data?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {track.data?.artist}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    Track {index + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <AudioPlayerProgress className="w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AudioPlayerTime />
                  <span className="text-sm text-gray-400">/</span>
                  <AudioPlayerDuration />
                </div>
                <AudioPlayerSpeedButtonGroup speeds={[0.5, 0.75, 1, 1.25, 1.5, 2]} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium mb-4">
              Themed Player
            </h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-4">
                <AudioPlayerButton className="bg-white/20 hover:bg-white/30 border-white/30" />
                <div className="flex-1">
                  <AudioPlayerProgress className="[&_[role=slider]]:bg-white/30 [&_[data-state=active]]:bg-white" />
                </div>
                <div className="flex items-center gap-2 text-white">
                  <AudioPlayerTime className="text-white" />
                  <span>/</span>
                  <AudioPlayerDuration className="text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-3">
              Labrish Caribbean Voice AI Platform
            </p>
          </div>
        </div>
      </AudioPlayerProvider>
    </div>
  );
}

export default AudioPlayerDemo;
