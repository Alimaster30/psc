// Type definitions for the File System Access API
// https://wicg.github.io/file-system-access/

interface FileSystemHandle {
  readonly kind: 'file' | 'directory';
  readonly name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: FileSystemWriteChunkType): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

type FileSystemWriteChunkType = 
  | Blob
  | BufferSource
  | string
  | { type: 'write'; position?: number; data: Blob | BufferSource | string }
  | { type: 'seek'; position: number }
  | { type: 'truncate'; size: number };

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface Window {
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
}
