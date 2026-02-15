import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/db';
import { media } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

        const userMedia = await db
            .select()
            .from(media)
            .where(eq(media.userId, session.user.id))
            .orderBy(desc(media.createdAt));

        return NextResponse.json({ media: userMedia });
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Nur PNG, JPG und WebP erlaubt' }, { status: 400 });
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Maximale Dateigröße: 10MB' }, { status: 400 });
        }

        // Save to public/uploads
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const ext = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        const fileUrl = `/uploads/${fileName}`;

        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Save to database
        const [newMedia] = await db.insert(media).values({
            userId: session.user.id,
            fileName: file.name,
            fileUrl,
            fileType: file.type,
            fileSize: file.size,
        }).returning();

        return NextResponse.json({ media: newMedia }, { status: 201 });
    } catch (error) {
        console.error('Error uploading media:', error);
        return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 });
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
            .delete(media)
            .where(and(eq(media.id, id), eq(media.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
