"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Card, Badge, Loader, useToast } from "@/components/ui";

interface FileWithPreview {
  file: File;
  id: string;
  preview: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  result?: {
    imageId: string;
    url: string;
    publicUrl: string;
  };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
];
const MAX_CONCURRENT_UPLOADS = 3;

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const uploadQueue = useRef<string[]>([]);
  const activeUploads = useRef<Set<string>>(new Set());

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only image files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 50MB limit";
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          validFiles.push({
            file,
            id,
            preview: URL.createObjectURL(file),
            status: "pending",
            progress: 0,
          });
        }
      });

      if (errors.length > 0) {
        showToast(errors.join("; "), "error");
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [showToast]
  );

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadFile = async (fileWithPreview: FileWithPreview) => {
    const { file, id } = fileWithPreview;

    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "uploading" as const, progress: 0 } : f
        )
      );

      const formData = new FormData();
      formData.append("files", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, progress: Math.round(percentComplete) } : f
            )
          );
        }
      });

      const uploadPromise = new Promise<{
        results: Array<{
          success: boolean;
          imageId?: string;
          url?: string;
          publicUrl?: string;
          error?: string;
        }>;
      }>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(new Error("Invalid response from server"));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || "Upload failed"));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      const response = await uploadPromise;

      if (response.results && response.results[0]) {
        const result = response.results[0];
        if (result.success && result.imageId && result.publicUrl) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? ({
                    ...f,
                    status: "success" as const,
                    progress: 100,
                    result: {
                      imageId: result.imageId as string,
                      url: (result.url || result.publicUrl) as string,
                      publicUrl: result.publicUrl as string,
                    },
                  } as FileWithPreview)
                : f
            )
          );
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    } finally {
      activeUploads.current.delete(id);
      processQueue();
    }
  };

  const processQueue = () => {
    while (
      uploadQueue.current.length > 0 &&
      activeUploads.current.size < MAX_CONCURRENT_UPLOADS
    ) {
      const nextId = uploadQueue.current.shift();
      if (nextId) {
        const file = files.find((f) => f.id === nextId);
        if (file && file.status === "pending") {
          activeUploads.current.add(nextId);
          uploadFile(file);
        }
      }
    }

    if (activeUploads.current.size === 0 && uploadQueue.current.length === 0) {
      setIsUploading(false);
    }
  };

  const startUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    if (pendingFiles.length === 0) {
      showToast("No files to upload", "warning");
      return;
    }

    setIsUploading(true);
    uploadQueue.current = pendingFiles.map((f) => f.id);
    processQueue();
  };

  const retryFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "pending" as const,
                error: undefined,
                progress: 0,
              }
            : f
        )
      );
      uploadQueue.current.push(id);
      if (!isUploading) {
        setIsUploading(true);
        processQueue();
      }
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${type} copied to clipboard!`, "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const getMarkdown = (url: string, filename: string) => {
    return `![${filename}](${url})`;
  };

  const getHTML = (url: string, filename: string) => {
    return `<img src="${url}" alt="${filename}" />`;
  };

  const clearCompleted = () => {
    setFiles((prev) => {
      prev
        .filter((f) => f.status === "success")
        .forEach((f) => URL.revokeObjectURL(f.preview));
      return prev.filter((f) => f.status !== "success");
    });
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <Badge variant="accent" className="mb-4">
          Image Upload
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Upload Your Images
        </h1>
        <p className="text-foreground-muted">
          Drag and drop images or click to browse. Supports JPEG, PNG, GIF,
          WebP, and more.
        </p>
      </div>

      <Card>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging
              ? "border-accent bg-accent/10 scale-[1.02]"
              : "border-border hover:border-accent/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragging ? "Drop files here" : "Drag and drop images here"}
              </p>
              <p className="text-sm text-foreground-muted mb-4">or</p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <p className="text-xs text-foreground-muted">
              Maximum file size: 50MB • Supported formats: JPEG, PNG, GIF, WebP,
              SVG, BMP, TIFF
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Files ({files.length})
                </h3>
                {pendingCount > 0 && (
                  <Badge variant="default">{pendingCount} pending</Badge>
                )}
                {uploadingCount > 0 && (
                  <Badge variant="info">{uploadingCount} uploading</Badge>
                )}
                {successCount > 0 && (
                  <Badge variant="success">{successCount} completed</Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="error">{errorCount} failed</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {successCount > 0 && (
                  <Button variant="outline" size="sm" onClick={clearCompleted}>
                    Clear Completed
                  </Button>
                )}
                {pendingCount > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={startUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader size="sm" />
                        <span className="ml-2">Uploading...</span>
                      </>
                    ) : (
                      `Upload ${pendingCount} ${pendingCount === 1 ? "File" : "Files"}`
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {files.map((fileWithPreview) => (
                <FilePreviewCard
                  key={fileWithPreview.id}
                  fileWithPreview={fileWithPreview}
                  onRemove={removeFile}
                  onRetry={retryFile}
                  onCopy={copyToClipboard}
                  getMarkdown={getMarkdown}
                  getHTML={getHTML}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

interface FilePreviewCardProps {
  fileWithPreview: FileWithPreview;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onCopy: (text: string, type: string) => void;
  getMarkdown: (url: string, filename: string) => string;
  getHTML: (url: string, filename: string) => string;
}

function FilePreviewCard({
  fileWithPreview,
  onRemove,
  onRetry,
  onCopy,
  getMarkdown,
  getHTML,
}: FilePreviewCardProps) {
  const { file, id, preview, status, progress, error, result } =
    fileWithPreview;

  const statusColors = {
    pending: "bg-ctp-surface1",
    uploading: "bg-ctp-blue/20 border-ctp-blue",
    success: "bg-ctp-green/20 border-ctp-green",
    error: "bg-ctp-red/20 border-ctp-red",
  };

  return (
    <div
      className={`border rounded-lg p-4 ${statusColors[status]} transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={file.name}
            className="w-20 h-20 object-cover rounded-md"
          />
          {status === "uploading" && (
            <div className="absolute inset-0 bg-ctp-crust/60 rounded-md flex items-center justify-center">
              <Loader size="sm" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-sm text-foreground-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              {status === "pending" && <Badge variant="default">Pending</Badge>}
              {status === "uploading" && (
                <Badge variant="info">Uploading {progress}%</Badge>
              )}
              {status === "success" && <Badge variant="success">Success</Badge>}
              {status === "error" && <Badge variant="error">Failed</Badge>}
              {(status === "pending" || status === "error") && (
                <button
                  onClick={() => onRemove(id)}
                  className="text-foreground-muted hover:text-ctp-red transition-colors"
                  aria-label="Remove"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {status === "uploading" && (
            <div className="w-full bg-ctp-surface0 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {status === "error" && error && (
            <div className="mt-2">
              <p className="text-sm text-ctp-red mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={() => onRetry(id)}>
                Retry
              </Button>
            </div>
          )}

          {status === "success" && result && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(result.publicUrl, "Direct link")}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCopy(getMarkdown(result.publicUrl, file.name), "Markdown")
                  }
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onCopy(getHTML(result.publicUrl, file.name), "HTML")
                  }
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  HTML
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(result.publicUrl, "_blank")}
                >
                  View Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
