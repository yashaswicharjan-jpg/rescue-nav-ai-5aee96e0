import { useState, useRef } from "react";
import { Camera, Upload, AlertTriangle, Loader2 } from "lucide-react";

export const VisualDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
      analyzeImage();
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    setAnalyzing(true);
    // Simulated analysis — will be replaced with real AI
    setTimeout(() => {
      setResult(
        "## Analysis Result\n\n⚠️ **Potential structural damage detected**\n\n### Recommendations:\n1. Do NOT enter the building\n2. Maintain safe distance (50+ meters)\n3. Report to emergency services\n4. Watch for falling debris\n\n🔴 Risk Level: **HIGH**"
      );
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Camera className="h-4 w-4 text-accent" />
        Visual Danger Detection
      </h2>

      {!image ? (
        <div className="space-y-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-primary hover:bg-secondary"
          >
            <div className="flex gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Upload className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Capture or Upload Image</p>
              <p className="text-xs text-muted-foreground">AI will analyze for dangers</p>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <img src={image} alt="Captured" className="w-full rounded-lg border border-border" />
          {analyzing ? (
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-foreground">Analyzing image for dangers...</span>
            </div>
          ) : result ? (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <div className="prose prose-sm prose-invert max-w-none text-foreground">
                {result.split("\n").map((line, i) => (
                  <p key={i} className={`${line.startsWith("#") ? "font-bold" : ""} my-0.5 text-sm`}>
                    {line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
          <button
            onClick={() => { setImage(null); setResult(null); }}
            className="w-full rounded-lg bg-secondary py-2 text-sm text-secondary-foreground hover:bg-muted"
          >
            Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
};
