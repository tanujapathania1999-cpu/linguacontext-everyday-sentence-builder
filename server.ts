import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API: Generate 10 conversational everyday sentences
  app.post('/api/generate-sentences', async (req, res) => {
    try {
      const { word, language = 'auto', seedModifier } = req.body;

      if (!word || typeof word !== 'string' || !word.trim()) {
        return res.status(400).json({
          error: 'Please enter a word to generate sentences.',
        });
      }

      const trimmedWord = word.trim();
      const targetLangInstruction =
        language && language !== 'auto'
          ? `The user specified target language: "${language}". Generate the sentences in this language.`
          : `Automatically detect the language of the word "${trimmedWord}". The sentences MUST be in that detected language.`;

      const prompt = `You are a native language tutor and lexicographer.
The user wants 10 natural, practical everyday conversational sentences using the word: "${trimmedWord}".
${targetLangInstruction}

Requirements:
1. Every sentence MUST naturally contain the target word "${trimmedWord}" or its legitimate grammatical inflection/conjugation in the target language.
2. The sentences must sound authentic, natural, and conversational—sentences people actually say in daily life (e.g. talking with friends, cafe/restaurant ordering, work/study, running errands, travel, asking questions, expressing personal opinions). Avoid stiff, archaic, or artificial textbook exercises.
3. If the word has multiple common everyday meanings or uses, demonstrate different meanings across the 10 sentences.
4. Keep the sentences relatively concise, clear, and practical.
5. Provide a colloquial, natural English translation for each sentence.
6. Provide an accurate, natural conversational Hindi translation (in Devanagari script) for each sentence, as well as the Hindi meaning of the word itself.
7. Assign an accurate difficulty level: "Beginner", "Intermediate", or "Advanced".
8. Assign an everyday situation category (e.g. "Dining & Cafe", "Daily Life", "Greetings", "Opinions", "Work & School", "Shopping", "Travel", "Friends & Family", "Requests").
9. Indicate the exact word form used in the original sentence so it can be highlighted.
${seedModifier ? `Variation key: ${seedModifier}. Provide a fresh alternative set of sentences.` : ''}`;

      const generateConfig = {
        systemInstruction:
          'You are a polyglot language education expert. You produce authentic everyday spoken sentences in any language with accurate English translations and natural Hindi translations in Devanagari script.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLanguage: {
              type: Type.STRING,
              description:
                'Name of the detected or selected language (e.g. Spanish, French, Japanese, German, English, Italian, Portuguese, Korean, Chinese, etc.)',
            },
            languageCode: {
              type: Type.STRING,
              description:
                'Standard 2-letter ISO 639-1 code (e.g. "es", "fr", "ja", "de", "en", "it", "zh", "ko", "pt", "ru", "ar", "hi", "nl")',
            },
            normalizedWord: {
              type: Type.STRING,
              description:
                'The word formatted cleanly with proper accent marks or native script',
            },
            partOfSpeech: {
              type: Type.STRING,
              description:
                'Part of speech (e.g. Noun, Verb, Adjective, Adverb, Phrase)',
            },
            primaryMeaning: {
              type: Type.STRING,
              description:
                'Concise English definition or primary meaning of the word',
            },
            hindiMeaning: {
              type: Type.STRING,
              description:
                'Accurate Hindi meaning/definition of the word in Devanagari script (e.g. "सुंदर / खूबसूरत" for beautiful)',
            },
            sentences: {
              type: Type.ARRAY,
              description:
                'Exactly 10 practical, conversational everyday sentences',
              items: {
                type: Type.OBJECT,
                properties: {
                  original: {
                    type: Type.STRING,
                    description:
                      'The sentence in the original language using the word',
                  },
                  english: {
                    type: Type.STRING,
                    description:
                      'Natural English translation of the sentence',
                  },
                  hindi: {
                    type: Type.STRING,
                    description:
                      'Natural Hindi translation of the sentence in Devanagari script',
                  },
                  targetWordForm: {
                    type: Type.STRING,
                    description:
                      'The exact substring/inflection of the word appearing in the original sentence',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Difficulty: Beginner, Intermediate, or Advanced',
                  },
                  situation: {
                    type: Type.STRING,
                    description:
                      'Conversational context (e.g. Dining & Cafe, Daily Life, Greetings, Opinions, Work & School, Shopping, Travel, Friends & Family, Requests)',
                  },
                },
                required: [
                  'original',
                  'english',
                  'hindi',
                  'targetWordForm',
                  'difficulty',
                  'situation',
                ],
              },
            },
          },
          required: [
            'detectedLanguage',
            'languageCode',
            'normalizedWord',
            'hindiMeaning',
            'sentences',
          ],
        },
      };

      // Model candidate list with retry for resilient generation
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let responseText = '';

      for (const modelName of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: generateConfig,
            });
            if (response.text) {
              responseText = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempt + 1} with ${modelName} failed:`, err?.message || err);
            // Brief backoff before retry
            await new Promise((r) => setTimeout(r, 800));
          }
        }
        if (responseText) break;
      }

      if (!responseText) {
        let cleanMsg = lastError?.message || 'Failed to generate sentences';
        try {
          const parsedErr = JSON.parse(cleanMsg);
          if (parsedErr?.error?.message) {
            cleanMsg = parsedErr.error.message;
          }
        } catch {}
        return res.status(503).json({
          error: cleanMsg,
        });
      }

      const parsedData = JSON.parse(responseText.trim());
      // Ensure exactly 10 sentences or at least whatever was returned with unique IDs
      const sentences = (parsedData.sentences || []).map(
        (s: any, index: number) => ({
          id: `sent-${Date.now()}-${index + 1}`,
          original: s.original || '',
          english: s.english || '',
          hindi: s.hindi || '',
          targetWordForm: s.targetWordForm || trimmedWord,
          difficulty: s.difficulty || 'Intermediate',
          situation: s.situation || 'Daily Life',
        })
      );

      return res.json({
        success: true,
        word: trimmedWord,
        detectedLanguage: parsedData.detectedLanguage || 'Detected Language',
        languageCode: parsedData.languageCode || 'en',
        normalizedWord: parsedData.normalizedWord || trimmedWord,
        partOfSpeech: parsedData.partOfSpeech || 'Word',
        primaryMeaning: parsedData.primaryMeaning || '',
        hindiMeaning: parsedData.hindiMeaning || '',
        sentences: sentences,
      });
    } catch (error: any) {
      console.error('Error generating sentences:', error);
      let errMsg = error?.message || 'Failed to generate sentences. Please try again in a moment.';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) errMsg = parsed.error.message;
      } catch {}
      return res.status(500).json({
        error: errMsg,
      });
    }
  });

  // API: Text-to-speech audio generation via Gemini TTS
  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required for TTS' });
      }

      if (!apiKey) {
        return res.status(503).json({
          error: 'Gemini API key not configured on server',
          fallback: true,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: 'Natural conversational tone, clear standard pronunciation',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!base64Audio) {
        return res.json({ fallback: true });
      }

      return res.json({
        audio: `data:audio/wav;base64,${base64Audio}`,
        format: 'audio/wav',
      });
    } catch (err: any) {
      console.warn('Server TTS unavailable, client will fallback:', err?.message);
      return res.json({ fallback: true, error: err?.message });
    }
  });

  // In development, hook up Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`LinguaContext server running at http://localhost:${port}`);
  });
}

startServer();
