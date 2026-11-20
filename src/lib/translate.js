// src/lib/translate.js
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL;

// Batas aman per chunk (di bawah limit ~500 byte, karena spasi/unicode membengkak)
const MAX_CHUNK = 400;

// ============================================
// 1. SANITASI: ganti karakter unicode yang bikin URL membengkak
// ============================================
function sanitize(text) {
  return text
    .replace(/[—–]/g, " - ")   // em dash & en dash → tanda hubung biasa
    .replace(/[“”]/g, '"')      // smart quotes → kutip lurus
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")       // rapikan spasi berlebih
    .trim();
}

// ============================================
// 2. CHUNKING: pecah teks panjang jadi potongan < MAX_CHUNK
// ============================================
function chunkText(text) {
  if (text.length <= MAX_CHUNK) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).trim().length > MAX_CHUNK) {
      if (current) chunks.push(current.trim());
      current = s;
      // Kalau satu kalimat masih kepanjangan, split per kata
      if (current.length > MAX_CHUNK) {
        const words = current.split(" ");
        let buf = "";
        for (const w of words) {
          if ((buf + " " + w).trim().length > MAX_CHUNK) {
            if (buf) chunks.push(buf.trim());
            buf = w;
          } else {
            buf = (buf + " " + w).trim();
          }
        }
        if (buf) chunks.push(buf.trim());
        current = "";
      }
    } else {
      current = (current + " " + s).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

// ============================================
// 3. SATU REQUEST translate (dengan timeout 8 detik)
// ============================================
async function translateOne(text) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
    `&langpair=id|en${MYMEMORY_EMAIL ? `&de=${MYMEMORY_EMAIL}` : ""}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    console.warn("[MyMemory] non-200:", data.responseStatus, data.responseDetails, "quotaFinished:", data.quotaFinished);
    return null;
  } catch (err) {
    console.warn("[MyMemory] fetch error:", err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================
// 4. API UTAMA: sanitize → chunk → paralel → join
// ============================================
export async function translateToEnglish(text) {
  if (!text || text.trim() === "") return null;

  const clean = sanitize(text);
  const chunks = chunkText(clean);
  const results = await Promise.all(chunks.map(translateOne));

  // Kalau ADA chunk yang gagal → kembalikan null (fallback ID penuh).
  // Jangan campur setengah EN setengah ID — itu jelek di UI.
  if (results.some((r) => r === null)) {
    console.warn("[MyMemory] sebagian chunk gagal → field ini fallback ke ID");
    return null;
  }

  return results.join(" ");
}

// ============================================
// 5. BATCH: translate banyak field sekaligus (paralel antar field)
// ============================================
export async function translateBatch(fieldsObj) {
  const entries = Object.entries(fieldsObj);
  const results = await Promise.all(
    entries.map(async ([key, value]) => [`${key}_en`, await translateToEnglish(value)])
  );
  return Object.fromEntries(results);
}