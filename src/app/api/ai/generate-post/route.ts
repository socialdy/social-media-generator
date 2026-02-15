import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { userSettings, brands } from '@/db/schema';
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

        // Get user's Gemini API key
        const [settings] = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id));

        const apiKey = settings?.geminiApiKey;
        if (!apiKey) {
            return NextResponse.json({
                error: 'Kein Gemini API-Key hinterlegt. Bitte gehen Sie zu Einstellungen und hinterlegen Sie Ihren API-Key.'
            }, { status: 400 });
        }

        // Get brand info if available
        const [brand] = await db
            .select()
            .from(brands)
            .where(eq(brands.userId, session.user.id));

        const body = await request.json();
        const { topic, tonality, platforms, targetAudience, additionalContext } = body;

        // Build prompt
        const tonalityMap: Record<string, string> = {
            professional: 'professionell und seriös',
            friendly: 'locker, freundlich und nahbar',
            informative: 'informativ und lehrreich',
            inspiring: 'inspirierend und motivierend',
            humorous: 'humorvoll und unterhaltsam',
        };

        const platformGuide = platforms.map((p: string) => {
            switch (p) {
                case 'instagram': return 'Instagram (max 2200 Zeichen, Emojis erwünscht, visuell ansprechend)';
                case 'facebook': return 'Facebook (moderater Umfang, Engagement fördern)';
                case 'linkedin': return 'LinkedIn (professionell, B2B-Fokus, Storytelling)';
                case 'twitter': return 'X/Twitter (max 280 Zeichen, knackig und prägnant)';
                default: return p;
            }
        }).join(', ');

        const brandContext = brand ? `
Unternehmen: ${brand.companyName || 'Nicht angegeben'}
Branche: ${brand.industry || 'Nicht angegeben'}
Zielgruppe des Unternehmens: ${brand.targetAudience || 'Nicht angegeben'}
Tone of Voice: ${brand.toneOfVoice || 'Nicht angegeben'}` : '';

        const prompt = `Du bist ein erfahrener Social Media Manager und Content Creator für den DACH-Raum (Deutschland, Österreich, Schweiz).

Erstelle genau 3 verschiedene Post-Varianten zu folgendem Thema:

**Thema:** ${topic}
**Tonalität:** ${tonalityMap[tonality] || 'professionell'}
**Plattform(en):** ${platformGuide}
${targetAudience ? `**Zielgruppe:** ${targetAudience}` : ''}
${additionalContext ? `**Zusätzlicher Kontext:** ${additionalContext}` : ''}
${brandContext}

Für jede Variante:
1. Erstelle einen eigenständigen, kreativen Post-Text
2. Generiere 5-8 passende Hashtags (Mix aus populär und Nische)
3. Achte auf die plattform-spezifischen Anforderungen

Antworte NUR im folgenden JSON-Format ohne Markdown-Codeblock:
[
  {
    "text": "Der vollständige Post-Text hier",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3"
  },
  {
    "text": "Variante 2...",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3"
  },
  {
    "text": "Variante 3...",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3"
  }
]`;

        // Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON response
        let variants;
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                variants = JSON.parse(jsonMatch[0]);
            } else {
                variants = JSON.parse(responseText);
            }
        } catch {
            // Fallback: create a single variant from the raw text
            variants = [
                { text: responseText, hashtags: '' },
            ];
        }

        return NextResponse.json({ variants });
    } catch (error: any) {
        console.error('Error generating post:', error);
        if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key')) {
            return NextResponse.json({ error: 'Ungültiger Gemini API-Key. Bitte überprüfen Sie Ihren Key in den Einstellungen.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Fehler bei der Content-Generierung' }, { status: 500 });
    }
}
