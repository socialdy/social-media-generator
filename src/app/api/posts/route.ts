import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { eq, desc, sql } from 'drizzle-orm';

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

        const userPosts = await db
            .select()
            .from(posts)
            .where(eq(posts.userId, session.user.id))
            .orderBy(desc(posts.createdAt));

        const stats = {
            total: userPosts.length,
            drafts: userPosts.filter(p => p.status === 'draft').length,
            scheduled: userPosts.filter(p => p.status === 'scheduled').length,
            published: userPosts.filter(p => p.status === 'published').length,
        };

        return NextResponse.json({ posts: userPosts, stats });
    } catch (error) {
        console.error('Error fetching posts:', error);
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
        const { content, platform, status, scheduledAt, hashtags, tonality, imageUrl } = body;

        if (!content || !platform) {
            return NextResponse.json({ error: 'Content und Plattform sind erforderlich' }, { status: 400 });
        }

        const [newPost] = await db.insert(posts).values({
            userId: session.user.id,
            content,
            platform,
            status: status || 'draft',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            hashtags,
            tonality,
            imageUrl,
        }).returning();

        return NextResponse.json({ post: newPost }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
