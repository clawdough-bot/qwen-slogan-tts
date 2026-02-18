"use client";

import { useState } from "react";
import styles from "./page.module.css";

const VOICES = [
  { id: "brand_male", label: "Brandowy męski" },
  { id: "brand_female", label: "Brandowy żeński" },
  { id: "narrator", label: "Narrator" },
  { id: "promo", label: "Promocyjny" },
];

const EMOTIONS = [
  { id: "neutral", label: "Neutralny" },
  { id: "excited", label: "Ekscytujący" },
  { id: "warm", label: "Ciepły" },
  { id: "serious", label: "Poważny" },
];

const SCENES = [
  {
    id: "tv_spot",
    label: "Spot TV",
    description: "Szeroki, nośny głos do reklamy telewizyjnej.",
    voice: "promo",
    emotion: "excited",
  },
  {
    id: "radio_ad",
    label: "Reklama radiowa",
    description: "Mocne, dynamiczne czytanie dla radia.",
    voice: "brand_male",
    emotion: "serious",
  },
  {
    id: "social_promo",
    label: "Social promo",
    description: "Lżejszy, bardziej rozmowny styl.",
    voice: "brand_female",
    emotion: "warm",
  },
  {
    id: "narration",
    label: "Narracja",
    description: "Spokojna, filmowa narracja.",
    voice: "narrator",
    emotion: "neutral",
  },
];

interface ClipMeta {
  url: string;
  voice: string;
  emotion: string;
  index: number;
}

export default function HomePage() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("brand_male");
  const [emotion, setEmotion] = useState("neutral");
  const [takes, setTakes] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  function applyScene(sceneId: string) {
    const scene = SCENES.find((s) => s.id === sceneId);
    if (!scene) return;
    setSelectedSceneId(sceneId);
    setVoice(scene.voice);
    setEmotion(scene.emotion);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setClips([]);

    if (!text.trim()) {
      setError("Wpisz slogan.");
      return;
    }

    const takesCount = Math.min(Math.max(Number(takes) || 1, 1), 5);

    setLoading(true);
    try {
      const newClips: ClipMeta[] = [];

      for (let i = 0; i < takesCount; i++) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice, emotion }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Nie udało się wygenerować audio.");
          break;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        newClips.push({ url, voice, emotion, index: i + 1 });
        setClips([...newClips]);
      }
    } catch (e: any) {
      setError(e?.message || "Nieznany błąd.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefineFromClip(clip: ClipMeta) {
    setVoice(clip.voice);
    setEmotion(clip.emotion);
    setSelectedSceneId(null);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.deviceShadow}>
        <div className={styles.deviceBody}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Qwen Slogan Studio</h1>
              <p className={styles.subtitle}>Skeuomorficzne studio nagraniowe w przeglądarce.</p>
            </div>
            <div className={styles.lampWrapper}>
              <span className={loading ? styles.lampOn : styles.lampOff} />
              <span className={styles.lampLabel}>{loading ? "NAGRANIE" : "GOTÓW"}</span>
            </div>
          </header>

          <section className={styles.content}>
            <form className={styles.form} onSubmit={handleGenerate}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tekst sloganu</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Twój biznes, nasz głos — razem brzmi lepiej."
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Scena</label>
                <div className={styles.sceneStrip}>
                  {SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={`${styles.sceneButton} ${
                        selectedSceneId === scene.id ? styles.sceneButtonActive : ""
                      }`}
                      onClick={() => applyScene(scene.id)}
                    >
                      <span className={styles.sceneLabel}>{scene.label}</span>
                      <span className={styles.sceneDescription}>{scene.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Głos</label>
                  <div className={styles.segmented}>
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVoice(v.id);
                          setSelectedSceneId(null);
                        }}
                        className={`${styles.segmentedButton} ${
                          voice === v.id ? styles.segmentedButtonActive : ""
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Intonacja</label>
                  <div className={styles.segmented}>
                    {EMOTIONS.map((eItem) => (
                      <button
                        key={eItem.id}
                        type="button"
                        onClick={() => {
                          setEmotion(eItem.id);
                          setSelectedSceneId(null);
                        }}
                        className={`${styles.segmentedButton} ${
                          emotion === eItem.id ? styles.segmentedButtonActive : ""
                        }`}
                      >
                        {eItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.fieldInline}>
                <label className={styles.label}>Liczba nagrań</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={takes}
                  onChange={(e) => setTakes(Number(e.target.value))}
                />
                <span className={styles.rangeValue}>{takes} ujęcia</span>
              </div>

              <button className={styles.primaryButton} type="submit" disabled={loading}>
                {loading ? "Nagrywam..." : "Nagraj slogan"}
              </button>

              {error && <p className={styles.error}>{error}</p>}
            </form>

            <aside className={styles.sidebar}>
              <h2 className={styles.panelTitle}>Nagrania</h2>
              {clips.length === 0 && !loading && (
                <p className={styles.emptyState}>Tutaj pojawią się wygenerowane ujęcia.</p>
              )}
              {loading && (
                <p className={styles.emptyState}>Nagrywam kolejne ujęcia...</p>
              )}
              <ul className={styles.clipList}>
                {clips.map((clip) => (
                  <li key={clip.index} className={styles.clipItem}>
                    <div className={styles.clipMeta}>
                      <span className={styles.clipTitle}>Ujęcie #{clip.index}</span>
                      <span className={styles.clipSubtitle}>
                        {clip.voice} · {clip.emotion}
                      </span>
                    </div>
                    <audio controls src={clip.url} className={styles.audio} />
                    <div className={styles.clipActions}>
                      <a
                        href={clip.url}
                        download={`slogan-take-${clip.index}.mp3`}
                        className={styles.downloadLink}
                      >
                        Pobierz mp3
                      </a>
                      <button
                        type="button"
                        className={styles.refineButton}
                        onClick={() => handleRefineFromClip(clip)}
                      >
                        Ustaw jako bazę
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}
