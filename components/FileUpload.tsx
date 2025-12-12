import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './Icons';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelect: (fileData: FileData) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (JPEG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      
      onFileSelect({
        file,
        previewUrl: result,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
      className={`
        group relative w-full h-80 rounded-3xl cursor-pointer transition-all duration-300 ease-out
        ${isDragging 
          ? 'scale-[1.01] shadow-xl ring-4 ring-blue-100 bg-blue-50/50' 
          : 'hover:shadow-xl hover:-translate-y-1 bg-gradient-to-b from-white to-slate-50 border border-slate-200'}
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
        accept="image/*"
      />

      {/* Decorative Corner Markers (Scanner Bed Look) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-slate-300 group-hover:border-blue-500 transition-colors duration-300 rounded-tl-lg"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-slate-300 group-hover:border-blue-500 transition-colors duration-300 rounded-tr-lg"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-slate-300 group-hover:border-blue-500 transition-colors duration-300 rounded-bl-lg"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-slate-300 group-hover:border-blue-500 transition-colors duration-300 rounded-br-lg"></div>

      {/* Scanning Laser Animation on Hover */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-[scan_1.5s_linear_infinite]" />
      </div>

      <div className="flex flex-col items-center justify-center h-full z-10 relative">
        <div className={`
          p-5 rounded-2xl mb-6 transition-all duration-300 shadow-sm
          ${isDragging 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
            : 'bg-white text-slate-600 group-hover:text-blue-600 group-hover:scale-110 border border-slate-100'}
        `}>
          <UploadIcon className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-slate-900">
          {isDragging ? 'Drop to Analyze' : 'Scan Document'}
        </h3>
        
        <p className="mt-3 text-sm text-slate-500 max-w-sm text-center font-medium leading-relaxed">
          <span className="text-slate-400">Drag & Drop or Click to Upload</span>
          <br/>
          <span className="text-xs mt-1 block opacity-75">Supports PDF (Image), JPG, PNG</span>
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;