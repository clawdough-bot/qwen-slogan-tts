import { NextRequest, NextResponse } from "next/server";

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TTS_MODEL = process.env.HF_TTS_MODEL ?? "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice";
const HF_API_TOKEN = process.env.HF_API_TOKEN;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { text, voice, emotion } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Brak tekstu" }, { status: 400 });
    }

    if (!HF_API_TOKEN) {
      return NextResponse.json({ error: "Brak konfiguracji HF_API_TOKEN" }, { status: 500 });
    }

    const body = {
      inputs: text,
      parameters: {
        speaker: voice,
        emotion,
        // prosty seed dla (lekko) różniących się generacji przy powtarzaniu
        seed: Date.now(),
      },
    };

    const hfRes = await fetch(`${HF_API_URL}/${encodeURIComponent(HF_TTS_MODEL)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("HF error:", hfRes.status, errText);
      return NextResponse.json({ error: "Błąd Hugging Face", detail: errText }, { status: 500 });
    }

    const arrBuf = await hfRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrBuf);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="slogan.mp3"',
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Błąd serwera", detail: e?.message },
      { status: 500 }
    );
  }
}
