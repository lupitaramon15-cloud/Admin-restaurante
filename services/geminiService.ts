
import { GoogleGenAI, Type, Modality, Chat, GenerateContentResponse, GenerateContentStreamResult, LiveSession, Blob, LiveServerMessage } from "@google/genai";
import { AspectRatio, ChatMessage } from "../types";
import { Language, translations } from "../locales";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

// --- Text & Chat ---

export function startChat(history: ChatMessage[]): Chat {
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: chatHistory,
    });
    return chat;
}

export async function sendMessage(message: string): Promise<GenerateContentResponse> {
    if (!chat) throw new Error("Chat not initialized");
    const response = await chat.sendMessage({ message });
    return response;
}

export async function getGroundedResponse(prompt: string): Promise<GenerateContentResponse> {
    return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
}

export async function getComplexAnalysis(prompt: string): Promise<GenerateContentResponse> {
    return await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
}

export async function getFastCompletion(prompt: string): Promise<GenerateContentResponse> {
    return await ai.models.generateContent({
        // FIX: Use 'gemini-flash-lite-latest' for the gemini flash lite model.
        model: 'gemini-flash-lite-latest',
        contents: prompt
    });
}


// --- Image ---

export async function generateImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function editImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
}

export async function analyzeImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
    });
    return response.text;
}


// --- Live Audio ---

export async function connectToLiveApi(callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
}, language: Language): Promise<LiveSession> {
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: translations[language].systemInstruction,
        },
    });
    return sessionPromise;
}

// --- Audio Helpers ---
// FIX: Add encode function for creating PCM blobs.
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// FIX: Add helper to create a PCM audio blob for the Live API.
export function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// FIX: Update decodeAudioData to be more robust and align with guidelines.
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}