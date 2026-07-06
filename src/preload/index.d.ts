import type { ElectronAPI } from "@electron-toolkit/preload";

interface ReasonixRpc {
  spawn(): Promise<void>;
  send(line: string): Promise<void>;
  kill(): Promise<void>;
  onEvent(cb: (data: { data: string }) => void): () => void;
  onStderr(cb: (data: { data: string }) => void): () => void;
  onExit(cb: (data: { code: number | null }) => void): () => void;
}

interface ReasonixCommands {
  listWorkspaceTree(root: string, maxDepth: number): Promise<
    Array<{ path: string; depth: number; kind: "dir" | "file"; name: string }>
  >;
  gitStatus(root: string): Promise<
    Array<{ path: string; kind: "untracked" | "added" | "deleted" | "modified" | "renamed" }>
  >;
  openInEditor(command: string, path: string, line?: number): Promise<void>;
  writeTextFile(path: string, content: string): Promise<void>;
}

interface ReasonixDialog {
  open(options?: unknown): Promise<Electron.OpenDialogReturnValue>;
  save(options?: unknown): Promise<Electron.SaveDialogReturnValue>;
}

interface ReasonixApp {
  getVersion(): Promise<string>;
  relaunch(): Promise<void>;
  getPath(name: string): Promise<string>;
}

interface ReasonixShell {
  openExternal(url: string): Promise<void>;
}

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface ProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

interface ReasonixUpdate {
  check(): Promise<void>;
  download(): Promise<void>;
  install(): Promise<void>;
  onChecking(cb: () => void): () => void;
  onAvailable(cb: (info: UpdateInfo) => void): () => void;
  onNotAvailable(cb: (info: { version: string }) => void): () => void;
  onError(cb: (err: { message: string }) => void): () => void;
  onDownloadProgress(cb: (progress: ProgressInfo) => void): () => void;
  onDownloaded(cb: (info: UpdateInfo) => void): () => void;
}

interface ReasonixApi {
  rpc: ReasonixRpc;
  commands: ReasonixCommands;
  dialog: ReasonixDialog;
  app: ReasonixApp;
  shell: ReasonixShell;
  update: ReasonixUpdate;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: ReasonixApi;
  }
}
