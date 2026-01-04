import React, { useState, useRef } from 'react';
import { Upload, Download, Minimize2 } from 'lucide-react';

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [quality, setQuality] = useState(80);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const fileInputRef = useRef(null);

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      setOriginalSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(event.target.result);
          setOriginalDimensions({ width: img.width, height: img.height });
          setCompressedImage(null);
          setCompressedSize(null);
          setCompressedBlob(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Compress image
  const compressImage = () => {
    if (!originalImage) return;

    setProcessing(true);

    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convert to blob for accurate file size
        canvas.toBlob((blob) => {
          if (blob) {
            setCompressedBlob(blob);
            setCompressedSize(blob.size);
            
            // Convert blob to data URL for preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setCompressedImage(reader.result);
              setProcessing(false);
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', quality / 100);
      };
      img.src = originalImage;
    }, 100);
  };

  // Download compressed image
  const downloadImage = () => {
    if (!compressedBlob) return;

    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${fileNameWithoutExt}_compressed.jpg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const compressionRatio = originalSize && compressedSize 
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Minimize2 className="w-8 h-8" />
            Image Compressor
          </h1>
          <p className="text-gray-400">
            Reduce image file size while maintaining quality
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

        {/* Quality Slider */}
        {originalImage && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <label className="block mb-3">
              <span className="text-lg font-semibold">Compression Quality: {quality}%</span>
              <p className="text-sm text-gray-400 mt-1">Higher quality = larger file size</p>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${quality}%, #374151 ${quality}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {originalImage && (
          <div className="mb-8 flex gap-4">
            <button
              onClick={compressImage}
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              <Minimize2 className="w-5 h-5" />
              {processing ? 'Processing...' : 'Compress Image'}
            </button>
            {compressedImage && (
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

        {/* Size Comparison */}
        {compressedImage && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Compression Results</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{formatBytes(originalSize)}</p>
                <p className="text-sm text-gray-400 mt-1">Original Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{formatBytes(compressedSize)}</p>
                <p className="text-sm text-gray-400 mt-1">Compressed Size</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{compressionRatio}%</p>
                <p className="text-sm text-gray-400 mt-1">Size Reduction</p>
              </div>
            </div>
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
                  {originalDimensions.width} × {originalDimensions.height} px • {formatBytes(originalSize)}
                </p>
              )}
              <div className="bg-gray-700 rounded overflow-hidden">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Compressed Image */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Compressed</h2>
              {compressedImage ? (
                <>
                  <p className="text-sm text-gray-400 mb-3">
                    {originalDimensions.width} × {originalDimensions.height} px • {formatBytes(compressedSize)}
                  </p>
                  <div className="bg-gray-700 rounded overflow-auto max-h-96">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="w-full h-auto"
                    />
                  </div>
                </>
              ) : (
                <div className="bg-gray-700 rounded h-64 flex items-center justify-center text-gray-500">
                  {processing ? 'Processing...' : 'Compressed image will appear here'}
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
              Select an image to begin compression. Supports PNG, JPG, WebP, and other common formats.
            </p>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Technical Details</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Compression Method: JPEG compression with adjustable quality</li>
            <li>Quality Range: 10% to 100%</li>
            <li>Output Format: JPEG for optimal compression</li>
            <li>Processing: Client-side, all data stays in your browser</li>
            <li>Recommended: 70-85% quality for good balance of size and quality</li>
            <li>File Size: Actual compressed file size, not Base64 encoded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
