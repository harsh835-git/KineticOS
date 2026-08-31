// Native Web Audio API tone synthesizer
const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  return AudioCtx ? new AudioCtx() : null;
};

// Play short beep tone (frequency in Hz, duration in ms)
export const playTone = (frequency = 600, duration = 120, type = "sine") => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (err) {
    console.warn("Audio synthesis error:", err);
  }
};

// Play a distinctive two-tone chime when timer hits zero
export const playCompletionChime = () => {
  playTone(587.33, 150, "triangle"); // D5
  setTimeout(() => {
    playTone(880, 300, "triangle"); // A5
  }, 120);
};

// Native Text-to-Speech callout
export const speakCue = (text) => {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Clear any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
};