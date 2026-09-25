import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, Camera } from 'lucide-react';

const DocumentUpload = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUploadSubmit = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      onUpload(file);
      setUploading(false);
      clearFile();
    }, 500);
  };

  return (
    <div className="ml-10 mb-4 max-w-sm w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {!file ? (
        <div 
          className={`p-6 border-2 border-dashed ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors m-2 rounded-lg`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-1">Click to take photo or upload file</p>
          <p className="text-xs text-gray-400">Supported formats: JPG, PNG, PDF</p>
          <input 
            type="file" 
            ref={inputRef}
            onChange={handleChange} 
            className="hidden" 
            accept="image/*,.pdf"
            capture="environment"
          />
        </div>
      ) : (
        <div className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center overflow-hidden">
              {preview ? (
                <img src={preview} alt="preview" className="w-12 h-12 object-cover rounded mr-3" />
              ) : (
                <div className="w-12 h-12 bg-indigo-100 flex items-center justify-center rounded mr-3 text-indigo-600">
                  <File className="w-6 h-6" />
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 truncate w-32 md:w-48">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!uploading && (
              <button onClick={clearFile} className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-xs text-indigo-600 font-medium">Analyzing document via OCR...</p>
            </div>
          ) : (
            <button 
              onClick={handleUploadSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Send for Verification
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
