import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function getFileExtension(fileName: string): string {
  const extension = path.extname(fileName || '').toLowerCase();
  return extension.replace('.', '') || 'pdf';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, DOC, and DOCX files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Resume file must be 5 MB or less' }, { status: 400 });
    }

    const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadsDirectory, { recursive: true });

    const extension = getFileExtension(file.name);
    const safeName = `${Date.now()}-${randomUUID()}.${extension}`;
    const absoluteFilePath = path.join(uploadsDirectory, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(absoluteFilePath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      url: `/uploads/resumes/${safeName}`,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Failed to upload resume', error);
    return NextResponse.json({ error: 'Resume upload failed' }, { status: 500 });
  }
}
