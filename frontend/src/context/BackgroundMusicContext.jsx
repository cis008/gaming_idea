import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const MUSIC_STORAGE_KEY = "backgroundMusicEnabled";

const BackgroundMusicContext = createContext({
  isMusicEnabled: true,
  setMusicEnabled: () => {},
  isBattleMusicActive: false,
  setBattleMusicActive: () => {},
  startBattleMusic: () => {},
  musicStatus: "idle",
  musicError: "",
});

function readStoredPreference() {
  const saved = localStorage.getItem(MUSIC_STORAGE_KEY);
  if (saved === null) return true;
  return saved === "true";
}

export function BackgroundMusicProvider({ children }) {
  const [isMusicEnabled, setMusicEnabled] = useState(readStoredPreference);
  const [isBattleMusicActive, setBattleMusicActive] = useState(false);
  const [musicStatus, setMusicStatus] = useState("idle");
  const [musicError, setMusicError] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/audio/pokemon-bg-voice.mp3");
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = "auto";
    const onError = () => {
      setMusicError("Background file not found at /audio/pokemon-bg-voice.mp3");
      setMusicStatus("error");
    };
    audio.addEventListener("error", onError);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener("error", onError);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(MUSIC_STORAGE_KEY, String(isMusicEnabled));
  }, [isMusicEnabled]);

  const startBattleMusic = () => {
    setBattleMusicActive(true);
    if (!isMusicEnabled || !audioRef.current) return;

    audioRef.current
      .play()
      .then(() => {
        setMusicError("");
        setMusicStatus("playing");
      })
      .catch(() => {
        setMusicStatus("blocked");
      });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const shouldPlay = isMusicEnabled && isBattleMusicActive;
    if (!shouldPlay) {
      audio.pause();
      setMusicStatus(isMusicEnabled ? "idle" : "disabled");
      return;
    }

    const tryPlay = () => {
      if (!audioRef.current || !isMusicEnabled || !isBattleMusicActive) return;
      audioRef.current
        .play()
        .then(() => {
          setMusicError("");
          setMusicStatus("playing");
        })
        .catch(() => {
          setMusicStatus("blocked");
        });
    };

    tryPlay();

    const events = ["click", "keydown", "touchstart"];
    events.forEach((eventName) => {
      window.addEventListener(eventName, tryPlay, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, tryPlay);
      });
    };
  }, [isBattleMusicActive, isMusicEnabled]);

  const value = useMemo(
    () => ({
      isMusicEnabled,
      setMusicEnabled,
      isBattleMusicActive,
      setBattleMusicActive,
      startBattleMusic,
      musicStatus,
      musicError,
    }),
    [isBattleMusicActive, isMusicEnabled, musicError, musicStatus]
  );

  return <BackgroundMusicContext.Provider value={value}>{children}</BackgroundMusicContext.Provider>;
}

export function useBackgroundMusic() {
  return useContext(BackgroundMusicContext);
}
