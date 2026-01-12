"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAudio = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
const crypto = __importStar(require("crypto"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Text-to-Speech client
const ttsClient = new text_to_speech_1.default.TextToSpeechClient();
// Get storage bucket
const bucket = admin.storage().bucket();
// Voice configuration for different languages
const VOICE_CONFIG = {
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
/**
 * Create MD5 hash of text for cache key
 */
function hashText(text) {
    return crypto.createHash("md5").update(text.toLowerCase().trim()).digest("hex");
}
/**
 * Firebase Callable Function to generate or retrieve cached TTS audio
 */
exports.generateAudio = functions
    .region("europe-west2")
    .https.onCall(async (data) => {
    // Validate input
    if (!data.text || typeof data.text !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Text is required and must be a string");
    }
    if (!data.language || !["ca-ES", "en-US"].includes(data.language)) {
        throw new functions.https.HttpsError("invalid-argument", "Language must be ca-ES or en-US");
    }
    const cleanText = data.text.trim();
    if (cleanText.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Text cannot be empty");
    }
    if (cleanText.length > 500) {
        throw new functions.https.HttpsError("invalid-argument", "Text too long (max 500 characters)");
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
        throw new functions.https.HttpsError("internal", "Failed to generate audio");
    }
    // Save audio to Storage
    await file.save(response.audioContent, {
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
//# sourceMappingURL=index.js.map