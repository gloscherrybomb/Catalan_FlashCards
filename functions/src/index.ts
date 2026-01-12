import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import textToSpeech from "@google-cloud/text-to-speech";
import * as crypto from "crypto";

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Text-to-Speech client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Get storage bucket
const bucket = admin.storage().bucket();

// Voice configuration for different languages
const VOICE_CONFIG: Record<string, {
  languageCode: string;
  name: string;
  ssmlGender: "FEMALE" | "MALE";
}> = {
  "ca-ES": {
    languageCode: "ca-ES",
    name: "ca-ES-Standard-A",
    ssmlGender: "FEMALE",
  },
  "en-US": {
    languageCode: "en-US",
    name: "en-US-Standard-D",
    ssmlGender: "MALE",
  },
};

interface GenerateAudioRequest {
  text: string;
  language: "ca-ES" | "en-US";
}

interface GenerateAudioResponse {
  url: string;
  cached: boolean;
}

/**
 * Create MD5 hash of text for cache key
 */
function hashText(text: string): string {
  return crypto.createHash("md5").update(text.toLowerCase().trim()).digest("hex");
}

/**
 * Firebase Callable Function to generate or retrieve cached TTS audio
 */
export const generateAudio = functions
  .region("europe-west2")
  .https.onCall(async (data: GenerateAudioRequest): Promise<GenerateAudioResponse> => {
    // Validate input
    if (!data.text || typeof data.text !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Text is required and must be a string"
      );
    }

    if (!data.language || !["ca-ES", "en-US"].includes(data.language)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Language must be ca-ES or en-US"
      );
    }

    const cleanText = data.text.trim();
    if (cleanText.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Text cannot be empty"
      );
    }

    if (cleanText.length > 500) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Text too long (max 500 characters)"
      );
    }

    // Generate cache key
    const textHash = hashText(cleanText);
    const filePath = `audio/${data.language}/${textHash}.mp3`;
    const file = bucket.file(filePath);

    // Check if audio already exists in cache
    const [exists] = await file.exists();

    if (exists) {
      // Return cached audio URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      return { url: publicUrl, cached: true };
    }

    // Generate new audio with Google Cloud TTS
    const voiceConfig = VOICE_CONFIG[data.language];

    const [response] = await ttsClient.synthesizeSpeech({
      input: { text: cleanText },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.9, // Slightly slower for language learning
        pitch: 0,
      },
    });

    if (!response.audioContent) {
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate audio"
      );
    }

    // Save audio to Storage
    await file.save(response.audioContent as Buffer, {
      contentType: "audio/mpeg",
      metadata: {
        cacheControl: "public, max-age=31536000", // Cache for 1 year
        metadata: {
          originalText: cleanText,
          language: data.language,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    return { url: publicUrl, cached: false };
  });
