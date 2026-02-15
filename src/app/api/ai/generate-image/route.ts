import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function getSession() {
    const session = await auth.getSession();
    return session;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        // Get user's API key (Nano Banana or fallback to Gemini for image description)
        const [settings] = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id));

        const geminiKey = settings?.geminiApiKey;
        if (!geminiKey) {
            return NextResponse.json({
                error: 'Kein API-Key hinterlegt. Bitte gehen Sie zu Einstellungen.'
            }, { status: 400 });
        }

        const body = await request.json();
        const { prompt, topic } = body;

        // Use Gemini's image generation via Imagen
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const imagePrompt = `Erstelle eine detaillierte Bildbeschreibung (auf Englisch) für ein Social Media Post Bild zum Thema: "${topic}". Context: "${prompt}". 
Die Beschreibung soll folgendes beinhalten: Stil, Farben, Komposition, sowie relevante visuelle Elemente. 
Nur die Bildbeschreibung ausgeben, sonst nichts.`;

        const result = await model.generateContent(imagePrompt);
        const imageDescription = result.response.text();

        // For MVP, return a placeholder image with the description
        // In production, this would call Nano Banana API
        const placeholderUrl = `https://placehold.co/1080x1080/0c1222/3B82F6?text=${encodeURIComponent(topic.substring(0, 20))}&font=roboto`;

        return NextResponse.json({
            imageUrl: placeholderUrl,
            description: imageDescription,
            note: 'Nano Banana Integration - Placeholder im MVP. Hinterlegen Sie Ihren Nano Banana API-Key für echte Bildgenerierung.',
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return NextResponse.json({ error: 'Fehler bei der Bild-Generierung' }, { status: 500 });
    }
}
