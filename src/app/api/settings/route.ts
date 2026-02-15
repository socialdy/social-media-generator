import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

async function getSession() {
    const session = await auth.getSession();
    return session;
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const [settings] = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id));

        return NextResponse.json({
            settings: settings ? {
                geminiApiKey: settings.geminiApiKey ? '••••••' + settings.geminiApiKey.slice(-4) : '',
                nanoBananaApiKey: settings.nanoBananaApiKey ? '••••••' + settings.nanoBananaApiKey.slice(-4) : '',
                defaultPlatform: settings.defaultPlatform,
                defaultTonality: settings.defaultTonality,
                language: settings.language,
                hasGeminiKey: !!settings.geminiApiKey,
                hasNanoBananaKey: !!settings.nanoBananaApiKey,
            } : null,
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const body = await request.json();
        const { geminiApiKey, nanoBananaApiKey, defaultPlatform, defaultTonality, language } = body;

        // Check if settings exist
        const [existing] = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, session.user.id));

        const updateValues: any = {
            updatedAt: new Date(),
        };

        if (geminiApiKey !== undefined && geminiApiKey !== '') updateValues.geminiApiKey = geminiApiKey;
        if (nanoBananaApiKey !== undefined && nanoBananaApiKey !== '') updateValues.nanoBananaApiKey = nanoBananaApiKey;
        if (defaultPlatform) updateValues.defaultPlatform = defaultPlatform;
        if (defaultTonality) updateValues.defaultTonality = defaultTonality;
        if (language) updateValues.language = language;

        if (existing) {
            await db
                .update(userSettings)
                .set(updateValues)
                .where(eq(userSettings.userId, session.user.id));
        } else {
            await db.insert(userSettings).values({
                userId: session.user.id,
                ...updateValues,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
