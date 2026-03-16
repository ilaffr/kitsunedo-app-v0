let japaneseVoice: SpeechSynthesisVoice | null = null;

function findJapaneseVoice(): SpeechSynthesisVoice | null {
  if (japaneseVoice) return japaneseVoice;
  const voices = speechSynthesis.getVoices();
  japaneseVoice =
    voices.find((v) => v.lang === "ja-JP" && v.localService) ??
    voices.find((v) => v.lang.startsWith("ja")) ??
    null;
  return japaneseVoice;
}

// Preload voices (they load async in some browsers)
if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.onvoiceschanged = () => findJapaneseVoice();
  findJapaneseVoice();
}

export function speakJapanese(text: string, rate = 0.85) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate;
  const voice = findJapaneseVoice();
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}
