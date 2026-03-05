/**
 * Supabase Storage Utility for PDF Reports
 *
 * Handles upload, download, and deletion of PDF files
 * using Supabase Storage (free tier: 1 GB).
 *
 * Required env vars:
 *   SUPABASE_URL              — e.g. https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  — service_role key from Supabase dashboard (bypasses RLS)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'reports';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'Add them to your .env file.'
      );
    }

    _client = createClient(url, key);
  }
  return _client;
}

/**
 * Ensure the storage bucket exists. Called once at startup.
 * Supabase doesn't error if the bucket already exists (we catch the 409).
 */
export async function ensureBucket(): Promise<void> {
  const client = getClient();
  const { error } = await client.storage.createBucket(BUCKET, {
    public: true,           // PDFs are served via public URL
    fileSizeLimit: 10485760, // 10 MB max per PDF
  });

  if (error && !error.message.includes('already exists')) {
    console.error('Failed to create storage bucket:', error.message);
  } else {
    console.log(`✅ Supabase storage bucket "${BUCKET}" ready`);
  }
}

/**
 * Upload a PDF buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadPDF(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const client = getClient();

  const { error } = await client.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Download a PDF from Supabase Storage as a Buffer.
 */
export async function downloadPDF(fileName: string): Promise<Buffer> {
  const client = getClient();

  const { data, error } = await client.storage
    .from(BUCKET)
    .download(fileName);

  if (error || !data) {
    throw new Error(`Supabase download failed: ${error?.message || 'No data'}`);
  }

  // Convert Blob to Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Delete a PDF from Supabase Storage.
 */
export async function deletePDF(fileName: string): Promise<void> {
  const client = getClient();

  const { error } = await client.storage
    .from(BUCKET)
    .remove([fileName]);

  if (error) {
    console.warn(`Supabase delete warning: ${error.message}`);
  }
}

/**
 * Extract the filename from a Supabase public URL.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/reports/my_file.pdf" → "my_file.pdf"
 */
export function extractFileName(publicUrl: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx >= 0) {
    return decodeURIComponent(publicUrl.substring(idx + marker.length));
  }
  // Fallback: take last segment
  return publicUrl.split('/').pop() || '';
}
