import { 
  FileVideo, FileImage, FileText, FileAudio, Files, FileCode,
  CheckCircle2, AlertCircle, Loader2, PlaySquare, 
  Scan, Layers, FileSearch, Database, Clock, User, List, Target, Check
} from 'lucide-react';

export type EvidenceType = "video" | "image" | "audio" | "document" | "mixed" | "unknown";

export function getEvidenceType(file: any): EvidenceType {
  const name = (file?.name || "").toLowerCase();
  const type = (file?.type || "").toLowerCase();

  // Video
  if (type === "video" || name.match(/\.(mp4|mov|avi|mkv|webm)$/)) return "video";
  // Image
  if (type === "image" || name.match(/\.(jpg|jpeg|png|webp|bmp|tiff)$/)) return "image";
  // Audio
  if (type === "audio" || name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/)) return "audio";
  // Document
  if (type === "document" || name.match(/\.(pdf|doc|docx|txt|rtf|xlsx|csv)$/)) return "document";
  // Mixed
  if (type === "folder" || type === "mixed") return "mixed";

  return "unknown";
}

export type EvidencePreparationStatus =
  | "queued"
  | "running"
  | "completed"
  | "needs_review"
  | "failed";

export const evidenceOutputContractConfig = {
  video: {
    badge: "VIDEO",
    icon: FileVideo,
    title: "Preparing video evidence",
    subtitle: "Finding key moments, checking playback quality, and preparing sequence blocks.",
    tags: ["KEY MOMENTS", "SEQUENCE BLOCKS", "TIMELINE"],
    steps: [
      { key: "reading", label: "Reading video file" },
      { key: "quality", label: "Checking playback quality" },
      { key: "key_moments", label: "Finding key moments" },
      { key: "sequence_blocks", label: "Preparing sequence blocks" },
      { key: "timeline_notes", label: "Preparing timeline notes" },
      { key: "workspace", label: "Preparing analysis workspace" }
    ],
    outputs: [
      { icon: Layers, label: "Sequence Blocks", desc: "Video moments organized into reviewable sections." },
      { icon: Target, label: "Key Moments", desc: "Important scenes prepared for quick review." },
      { icon: Scan, label: "Visual Observations", desc: "Visible details captured from the footage." },
      { icon: Clock, label: "Timeline Notes", desc: "Time-based notes prepared from the video." },
      { icon: Database, label: "Metadata", desc: "Duration, format, and source information." }
    ],
    warning: "Some frames look dark or unclear. Please review key moments manually.",
    success: "Video evidence ready for review."
  },
  image: {
    badge: "IMAGE",
    icon: FileImage,
    title: "Preparing image evidence",
    subtitle: "Checking image clarity, marking visible details, and preparing observation notes.",
    tags: ["VISUAL CHECK", "OBSERVATIONS", "QUALITY"],
    steps: [
      { key: "reading", label: "Reading image file" },
      { key: "quality", label: "Checking image clarity" },
      { key: "marking", label: "Marking visible details" },
      { key: "observation", label: "Preparing observation notes" },
      { key: "workspace", label: "Preparing analysis workspace" }
    ],
    outputs: [
      { icon: Scan, label: "Visual Observations", desc: "Visible details prepared for review." },
      { icon: Target, label: "Detected Areas", desc: "Important image areas marked." },
      { icon: FileText, label: "Image Notes", desc: "Short notes generated from the image." },
      { icon: CheckCircle2, label: "Quality Check", desc: "Image clarity checked before analysis." },
      { icon: Database, label: "Metadata", desc: "Format, size, and source information." }
    ],
    warning: "Image looks blurry. Some details may need manual review.",
    success: "Image evidence ready for review."
  },
  audio: {
    badge: "AUDIO",
    icon: FileAudio,
    title: "Preparing audio evidence",
    subtitle: "Checking sound quality, preparing transcript segments, and separating speaker turns.",
    tags: ["TRANSCRIPT", "SPEAKER TURNS", "TIME REFERENCES"],
    steps: [
      { key: "reading", label: "Reading audio file" },
      { key: "quality", label: "Checking sound quality" },
      { key: "transcript", label: "Preparing transcript" },
      { key: "speaker_turns", label: "Separating speaker turns" },
      { key: "mentions", label: "Marking important mentions" },
      { key: "workspace", label: "Preparing analysis workspace" }
    ],
    outputs: [
      { icon: FileText, label: "Transcript Segments", desc: "Audio prepared into time-based text sections." },
      { icon: User, label: "Speaker Turns", desc: "Voice changes organized for review." },
      { icon: Target, label: "Important Mentions", desc: "Relevant words or phrases highlighted." },
      { icon: Clock, label: "Time References", desc: "Key parts linked to audio time." },
      { icon: Database, label: "Metadata", desc: "Duration, format, and source information." }
    ],
    warning: "Audio has low volume or background noise. Transcript may need checking.",
    success: "Audio evidence ready for review."
  },
  document: {
    badge: "DOCUMENT",
    icon: FileText,
    title: "Preparing document evidence",
    subtitle: "Reading pages, checking readable text, and preparing key notes.",
    tags: ["TEXT READING", "KEY SECTIONS", "PAGE REFERENCES"],
    steps: [
      { key: "reading", label: "Reading document pages" },
      { key: "quality", label: "Checking readable text" },
      { key: "sections", label: "Finding key sections" },
      { key: "notes", label: "Preparing document notes" },
      { key: "references", label: "Preparing page references" },
      { key: "workspace", label: "Preparing analysis workspace" }
    ],
    outputs: [
      { icon: FileSearch, label: "Document Summary", desc: "High-level overview of contents." },
      { icon: Layers, label: "Key Sections", desc: "Important parts highlighted." },
      { icon: Target, label: "Extracted Facts", desc: "Names, dates, and locations prepared." },
      { icon: List, label: "Page References", desc: "Pages indexed for quick lookup." },
      { icon: Database, label: "Metadata", desc: "Author, creation date, and format." }
    ],
    warning: "Some text may be difficult to read. Please review highlighted sections.",
    success: "Document evidence ready for review."
  },
  mixed: {
    badge: "MIXED",
    icon: Files,
    title: "Preparing evidence set",
    subtitle: "Checking all files, preparing file-specific outputs, and connecting related evidence.",
    tags: ["FILE QUEUE", "CONNECTIONS", "TIMELINE"],
    steps: [
      { key: "reading", label: "Reading evidence files" },
      { key: "quality", label: "Checking file quality" },
      { key: "outputs", label: "Preparing file-specific outputs" },
      { key: "connecting", label: "Connecting related evidence" },
      { key: "timeline", label: "Preparing timeline candidates" },
      { key: "workspace", label: "Preparing review workspace" }
    ],
    outputs: [
      { icon: List, label: "Evidence List", desc: "Files organized by type and status." },
      { icon: Layers, label: "Cross-file Notes", desc: "Related findings prepared across files." },
      { icon: Clock, label: "Timeline Candidates", desc: "Time-based clues grouped for review." },
      { icon: FileSearch, label: "Source References", desc: "Findings linked back to the original files." },
      { icon: Database, label: "Metadata", desc: "File count, format, and upload information." }
    ],
    warning: "Some files need manual review before final analysis.",
    success: "Evidence set ready for review."
  },
  unknown: {
    badge: "EVIDENCE",
    icon: FileCode,
    title: "Preparing evidence file",
    subtitle: "Checking file structure and preparing contents for review.",
    tags: ["PROCESSING", "VALIDATION"],
    steps: [
      { key: "reading", label: "Reading file structure" },
      { key: "quality", label: "Checking data integrity" },
      { key: "processing", label: "Extracting file contents" },
      { key: "workspace", label: "Preparing review workspace" }
    ],
    outputs: [
      { icon: FileText, label: "Extracted Contents", desc: "Raw data ready for review." },
      { icon: CheckCircle2, label: "Quality Check", desc: "Data integrity verification." },
      { icon: Database, label: "Metadata", desc: "Format, size, and source information." }
    ],
    warning: "Unknown format detected. Manual review may be required.",
    success: "Evidence file ready for review."
  }
};
