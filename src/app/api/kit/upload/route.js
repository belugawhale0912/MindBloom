import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'video' or 'photo'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine bucket name based on type
    const bucketName = type === 'video' ? 'video' : 'image';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe and unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `${timestamp}-${safeName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    console.log("SUCCESS! Generated Public URL:", publicUrl);

    return NextResponse.json({ url: publicUrl, filename: file.name });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
