import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

async function getSession() {
    const session = await auth.getSession();
    return session;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const { id } = await params;
        const [post] = await db
            .select()
            .from(posts)
            .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)));

        if (!post) {
            return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const [updated] = await db
            .update(posts)
            .set({
                ...body,
                updatedAt: new Date(),
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
            })
            .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({ post: updated });
    } catch (error) {
        console.error('Error updating post:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const { id } = await params;
        const [deleted] = await db
            .delete(posts)
            .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
