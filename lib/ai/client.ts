import Groq from "groq-sdk";

function createGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

let _groq: ReturnType<typeof createGroq> | null = null;

export function getGroq() {
  if (!_groq) {
    _groq = createGroq();
  }
  return _groq;
}
