'use client'

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {
	MediaPlayer,
	MediaProvider,
	Poster,
} from "@vidstack/react";
import {
	DefaultVideoLayout,
	defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { env } from "@/lib/env/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { toast } from "sonner";

type StreamingData = {
    provider: "hianime";
    episode: {
      details: {
          id: string;
          type: "episodes";
          links: {
              self: string;
          };
          attributes: {
              synopsis?: string | null | undefined;
              description?: string | null | undefined;
              canonicalTitle?: string | undefined;
              seasonNumber?: number | null | undefined;
              relativeNumber?: number | null | undefined;
              airdate?: string | null | undefined;
              thumbnail?: {
                  original: string;
              } | undefined;
              number: number;
              titles: {
                  en?: string | undefined;
                  en_jp?: string | undefined;
                  en_us?: string | undefined;
                  ja_jp?: string | undefined;
              };
              length: number | null;
              createdAt: string;
              updatedAt: string;
          };
          relationships: any;
      };
      sources: {   type: "SUB" | "DUB" | "SUB_DUB";
        sources: {
            type: string;
            file: string;
        };
        tracks: {
            label?: string | undefined;
            kind?: string | undefined;
            default?: boolean | undefined;
            file: string;
        }[];
        intro: {
            start: number;
            end: number;
        };
        outro: {
            start: number;
            end: number;
        };
        serverId: number;
      }
      subtitles: {
        source: "remote";
        url: string;
        name: string;
        size: number;
        last_modified: number;
      }[] | {
        source: "client";
        name: string;
        size: number;
        last_modified: number;
        content: string;
      }[]
    }
}

const anilistIds = [
  9253, // steins;gate
  101348, // vinland saga
  20661, // Terror in resonance
  30, // evangelion
  19, // monster
  1535, // death note
  154587, // frieren
  21234, // erased
  185407, // takopi
  21827, // violet evergarden
]

const proxyOptions = [
  { value: "bettermelon", label: "Bettermelon" },
  { value: "local", label: "Local" },
] as const;

export default function Home() {
  const [src, setSrc] = useState<string>("")
  const [thumbnails, setThumbnails] = useState<string>("")
  const [poster, setPoster] = useState<string>("")
  const [proxy, setProxy] = useState<"bettermelon" | "local">("bettermelon")
  const [isLoading, setIsLoading] = useState(false)
  
  const generateSrc = async () => {
    try {
      setIsLoading(true)
      const randomId = anilistIds[Math.floor(Math.random() * anilistIds.length)];
      
      const response = await fetch(`https://api.bettermelon.ru/anime/${randomId}/1/hianime`);
      const data: { data: StreamingData } = await response.json();

      const streamingData = data.data

      const proxyUrl = proxy === "bettermelon" 
        ? "https://proxy.bettermelon.ru" 
        : env.NEXT_PUBLIC_PROXY_URL;
      
      const src = `${proxyUrl}/proxy?url=${streamingData.episode.sources.sources.file}`
      setSrc(src)

      const poster = `${proxyUrl}/proxy?url=${streamingData.episode.details.attributes.thumbnail?.original}`
      setPoster(poster)

		  const thumbnails = streamingData?.episode.sources.tracks.find((t) => t.kind === "thumbnails");
      setThumbnails(thumbnails?.file || "")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong!"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

	return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            onClick={generateSrc}
            disabled={isLoading}
            size="lg"
            className="cursor-pointer gap-2"
          >
            <Play className="h-4 w-4" />
            {isLoading ? "Loading..." : "Generate Random Anime"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                Proxy: {proxyOptions.find(p => p.value === proxy)?.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Select Proxy</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {proxyOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setProxy(option.value)}
                  className="cursor-pointer"
                >
                  <span className={proxy === option.value ? "font-semibold" : ""}>
                    {option.label}
                  </span>
                  {proxy === option.value && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {src && (
          <div className="max-w-5xl mx-auto">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <MediaPlayer
                src={src}
                viewType="video"
                streamType="on-demand"
                logLevel="warn"
                crossOrigin
                playsInline
                title="Proxy Player"
                poster={poster}
              >
                <MediaProvider>
                  <Poster className="vds-poster" />
                </MediaProvider>
                <DefaultVideoLayout
                  thumbnails={thumbnails}
                  icons={defaultLayoutIcons}
                />
              </MediaPlayer>
            </div>
          </div>
        )}

        {!src && !isLoading && (
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
              <div className="text-center space-y-3">
                <div className="text-slate-400 dark:text-slate-600 text-6xl">🎬</div>
                <p className="text-slate-500 dark:text-slate-400">
                  Click "Generate Random Anime" to start watching
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
	);
}