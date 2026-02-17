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

export default function HomePage() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("brand_male");
  const [emotion, setEmotion] = useState("neutral");
  const [takes, setTakes] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clips, setClips] = useState<string[]>([]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setClips([]);

    if (!text.trim()) {
      setError("Wpisz slogan.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, emotion, takes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Nie udało się wygenerować audio.");
        return;
      }

      const zipBlob = await res.blob();
      const url = URL.createObjectURL(zipBlob);
      // Tymczasowo 1 link – w kolejnym kroku rozpakujemy ZIP po stronie klienta
      setClips([url]);
    } catch (e: any) {
      setError(e?.message || "Nieznany błąd.");
    } finally {
      setLoading(false);
    }
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

              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Głos</label>
                  <div className={styles.segmented}>
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoice(v.id)}
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
                        onClick={() => setEmotion(eItem.id)}
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
              {clips.length === 0 && (
                <p className={styles.emptyState}>Tutaj pojawią się wygenerowane ujęcia.</p>
              )}
              <ul className={styles.clipList}>
                {clips.map((url, i) => (
                  <li key={i} className={styles.clipItem}>
                    <div className={styles.clipMeta}>
                      <span className={styles.clipTitle}>Ujęcie #{i + 1}</span>
                      <span className={styles.clipSubtitle}>{voice} · {emotion}</span>
                    </div>
                    <audio controls src={url} className={styles.audio} />
                    <a href={url} download={`slogan-take-${i + 1}.mp3`} className={styles.downloadLink}>
                      Pobierz mp3
                    </a>
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
