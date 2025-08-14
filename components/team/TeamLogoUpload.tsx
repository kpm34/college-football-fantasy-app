'use client';

import { useState } from 'react';
import { storage, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Models } from 'appwrite';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

interface TeamLogoUploadProps {
  teamId: string;
  currentLogoId?: string;
  teamName: string;
  onUploadComplete?: (logoUrl: string) => void;
}

export function TeamLogoUpload({ 
  teamId, 
  currentLogoId, 
  teamName, 
  onUploadComplete 
}: TeamLogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get current logo URL
  const currentLogoUrl = currentLogoId 
    ? storage.getFilePreview('team-logos', currentLogoId, 200, 200).href
    : null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('File must be JPG, PNG, WebP, or SVG');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file || !preview) return;

    setUploading(true);
    setError(null);

    try {
      // Delete old logo if exists
      if (currentLogoId) {
        try {
          await storage.deleteFile('team-logos', currentLogoId);
          console.log('Deleted old logo');
        } catch (err) {
          console.log('Could not delete old logo:', err);
          // Continue anyway - user might not own the old file
        }
      }

      // Upload new logo
      const response = await storage.createFile(
        'team-logos',
        ID.unique(),
        file
      );

      console.log('Logo uploaded:', response.$id);

      // Update team/roster with new logo ID
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS, // Using rosters collection as per your schema
        teamId,
        { 
          logoId: response.$id,
          logoUrl: storage.getFilePreview('team-logos', response.$id, 200, 200).href
        }
      );

      // Get the preview URL
      const logoUrl = storage.getFilePreview(
        'team-logos',
        response.$id,
        200,
        200,
        'center' as any, // gravity
        100 // quality
      ).href;

      setSuccess(true);
      onUploadComplete?.(logoUrl);

      // Reset after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setPreview(null);
        if (fileInput) fileInput.value = '';
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreview(null);
    setError(null);
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Logo</h3>
          <p className="text-sm text-gray-600">Upload a logo for {teamName}</p>
        </div>
        
        {currentLogoUrl && !preview && (
          <div className="relative w-20 h-20">
            <Image
              src={currentLogoUrl}
              alt={`${teamName} logo`}
              fill
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* File Input */}
      {!preview && (
        <div>
          <input
            type="file"
            id="logo-upload"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="logo-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
          >
            <FiUpload />
            {currentLogoId ? 'Change Logo' : 'Upload Logo'}
          </label>
          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG, WebP, or SVG • Max 5MB
          </p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <div className="relative inline-block">
            <div className="relative w-32 h-32">
              <Image
                src={preview}
                alt="Logo preview"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            {success && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-90 rounded-lg flex items-center justify-center">
                <FiCheck className="text-white text-4xl" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading || success}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : success ? 'Uploaded!' : 'Confirm Upload'}
            </button>
            <button
              onClick={cancelUpload}
              disabled={uploading || success}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">Logo uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
