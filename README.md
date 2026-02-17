# Qwen Slogan Studio

Generator sloganów audio w przeglądarce, zasilany modelem [Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice).

- Next.js 16 (App Router)
- Bun jako runtime
- Skeuomorficzny interfejs przypominający konsolę nagraniową
- Wybór głosu, intonacji i liczby ujęć

## Konfiguracja

1. Sklonuj repozytorium:

```bash
bunx degit clawdough-bot/qwen-slogan-tts
cd qwen-slogan-tts
```

2. Skonfiguruj zmienne środowiskowe:

```bash
cp .env.example .env.local
# w .env.local ustaw:
# HF_API_TOKEN=hf_...
# HF_TTS_MODEL=Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (opcjonalnie)
```

3. Uruchom dev server:

```bash
bun install
bun run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`.

## Użycie

- Wybierz głos i intonację.
- Ustaw liczbę ujęć (1–5).
- Wpisz tekst sloganu.
- Kliknij "Nagraj slogan".
- Odtwarzaj i pobieraj wygenerowane mp3 bezpośrednio z listy ujęć.

## Uwaga nt. parametrów modelu

Parametry `speaker` i `emotion` przekazywane do endpointu Hugging Face są prostą mapą
z identyfikatorów interfejsu (np. `brand_male`, `warm`). Zaleca się dostosowanie ich
zgodnie z dokumentacją modelu Qwen3-TTS (np. jeśli model używa innych nazw / ID).

## Licencja

MIT
