import React, { useState, useRef } from 'react';
import { Upload, Download, ZoomIn } from 'lucide-react';

export default function ImageUpscaler() {
  const [originalImage, setOriginalImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [upscaledDimensions, setUpscaledDimensions] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(event.target.result);
          setOriginalDimensions({ width: img.width, height: img.height });
          setUpscaledImage(null);
          setUpscaledDimensions(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Upscale image to 400% using bicubic interpolation
  const upscaleImage = () => {
    if (!originalImage) return;

    setProcessing(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const scaleFactor = 4;
        const newWidth = img.width * scaleFactor;
        const newHeight = img.height * scaleFactor;

        // Create canvas with upscaled dimensions
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');

        // Disable image smoothing for pixel-perfect control
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the upscaled image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        const upscaledDataUrl = canvas.toDataURL('image/png');
        setUpscaledImage(upscaledDataUrl);
        setUpscaledDimensions({ width: newWidth, height: newHeight });
        setProcessing(false);
      };
      img.src = originalImage;
    }, 100);
  };

  // Download upscaled image
  const downloadImage = () => {
    if (!upscaledImage) return;

    const link = document.createElement('a');
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${fileNameWithoutExt}_upscaled_4x.png`;
    link.href = upscaledImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ZoomIn className="w-8 h-8" />
            Image Upscaler
          </h1>
          <p className="text-gray-400">
            Upscale images to 400% their original resolution with high-quality bicubic interpolation
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            Select Image
          </button>
          {fileName && (
            <p className="mt-2 text-sm text-gray-400">Selected: {fileName}</p>
          )}
        </div>

        {/* Action Buttons */}
        {originalImage && (
          <div className="mb-8 flex gap-4">
            <button
              onClick={upscaleImage}
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              <ZoomIn className="w-5 h-5" />
              {processing ? 'Processing...' : 'Upscale to 400%'}
            </button>
            {upscaledImage && (
              <button
                onClick={downloadImage}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            )}
          </div>
        )}

        {/* Image Comparison */}
        {originalImage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Original</h2>
              {originalDimensions && (
                <p className="text-sm text-gray-400 mb-3">
                  {originalDimensions.width} × {originalDimensions.height} px
                </p>
              )}
              <div className="bg-gray-700 rounded overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-auto"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>

            {/* Upscaled Image */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Upscaled (400%)</h2>
              {upscaledDimensions ? (
                <>
                  <p className="text-sm text-gray-400 mb-3">
                    {upscaledDimensions.width} × {upscaledDimensions.height} px
                  </p>
                  <div className="bg-gray-700 rounded overflow-auto max-h-96">
                    <img
                      src={upscaledImage}
                      alt="Upscaled"
                      className="w-full h-auto"
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                </>
              ) : (
                <div className="bg-gray-700 rounded h-64 flex items-center justify-center text-gray-500">
                  {processing ? 'Processing...' : 'Upscaled image will appear here'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Panel */}
        {!originalImage && (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Image Selected</h3>
            <p className="text-gray-400">
              Select an image to begin upscaling. Supports PNG, JPG, WebP, and other common formats.
            </p>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Technical Details</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Upscaling Method: Bicubic interpolation with high-quality canvas rendering</li>
            <li>Scale Factor: 4x (400% of original dimensions)</li>
            <li>Output Format: PNG for lossless quality</li>
            <li>Processing: Client-side, all data stays in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}