import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { brands } from '@/db/schema';
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

        const [brand] = await db
            .select()
            .from(brands)
            .where(eq(brands.userId, session.user.id));

        return NextResponse.json({ brand });
    } catch (error) {
        console.error('Error fetching brand:', error);
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

        const [existing] = await db
            .select()
            .from(brands)
            .where(eq(brands.userId, session.user.id));

        if (existing) {
            await db
                .update(brands)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(brands.userId, session.user.id));
        } else {
            await db.insert(brands).values({
                userId: session.user.id,
                ...body,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating brand:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
