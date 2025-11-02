"use client";

import { useState } from "react";
import { Button, Card, Input, Badge, Skeleton, Loader } from "@/components/ui";

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate upload
    setTimeout(() => {
      setIsLoading(false);
      alert("Upload successful! (This is a demo)");
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <Badge variant="info" className="mb-4">
          Upload Demo
        </Badge>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Upload Your Files
        </h1>
        <p className="text-foreground-muted">
          This page demonstrates the UI components with a file upload interface.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Upload Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              type="text"
              placeholder="Enter a title"
              required
            />

            <Input
              label="Description"
              type="text"
              placeholder="Enter a description"
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-ctp-surface0 border border-border rounded-md text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-background hover:file:bg-accent-hover file:cursor-pointer transition-all duration-200"
                required
              />
              {fileName && (
                <p className="mt-2 text-sm text-ctp-green">
                  Selected: {fileName}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size="sm" />
                  Uploading...
                </span>
              ) : (
                "Upload File"
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Component Showcase
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="accent">Accent</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Buttons
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">
                    Primary
                  </Button>
                  <Button variant="secondary" size="sm">
                    Secondary
                  </Button>
                  <Button variant="outline" size="sm">
                    Outline
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Loading States
                </h3>
                <div className="flex items-center gap-4">
                  <Loader size="sm" />
                  <Loader size="md" />
                  <Loader size="lg" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Skeleton Loading
            </h2>
            <div className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height="100px" />
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="text-center">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Theme Colors
        </h2>
        <p className="text-foreground-muted mb-6">
          Catppuccin Macchiato color palette
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[
            { name: "Mauve", color: "bg-ctp-mauve" },
            { name: "Lavender", color: "bg-ctp-lavender" },
            { name: "Blue", color: "bg-ctp-blue" },
            { name: "Sapphire", color: "bg-ctp-sapphire" },
            { name: "Sky", color: "bg-ctp-sky" },
            { name: "Teal", color: "bg-ctp-teal" },
            { name: "Green", color: "bg-ctp-green" },
            { name: "Yellow", color: "bg-ctp-yellow" },
            { name: "Peach", color: "bg-ctp-peach" },
            { name: "Maroon", color: "bg-ctp-maroon" },
            { name: "Red", color: "bg-ctp-red" },
            { name: "Pink", color: "bg-ctp-pink" },
            { name: "Flamingo", color: "bg-ctp-flamingo" },
            { name: "Rosewater", color: "bg-ctp-rosewater" },
          ].map((color) => (
            <div key={color.name} className="text-center">
              <div
                className={`${color.color} h-12 rounded-md shadow-soft mb-2`}
              />
              <p className="text-xs text-foreground-muted">{color.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
