import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { socialAccounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

        const accounts = await db
            .select()
            .from(socialAccounts)
            .where(eq(socialAccounts.userId, session.user.id));

        return NextResponse.json({ accounts });
    } catch (error) {
        console.error('Error fetching social accounts:', error);
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
        const { platform, accountName, accountHandle } = body;

        if (!platform || !accountName) {
            return NextResponse.json({ error: 'Plattform und Account-Name sind erforderlich' }, { status: 400 });
        }

        const [newAccount] = await db.insert(socialAccounts).values({
            userId: session.user.id,
            platform,
            accountName,
            accountHandle: accountHandle || '',
        }).returning();

        return NextResponse.json({ account: newAccount }, { status: 201 });
    } catch (error) {
        console.error('Error adding social account:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 });
        }

        await db
            .delete(socialAccounts)
            .where(and(eq(socialAccounts.id, id), eq(socialAccounts.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting social account:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
