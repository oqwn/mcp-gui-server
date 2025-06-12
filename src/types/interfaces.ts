import { ChildProcess } from "child_process";

export interface GuiSession {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  prompt?: string;
  title?: string;
  commandLogs?: string[];
  runningProcess?: ChildProcess;
  projectDirectory?: string;
  shellProcess?: ChildProcess;
  shellReady?: boolean;
}

export interface LLMProvider {
  name: string;
  key: string;
  baseUrl: string;
  model: string;
}

export interface GuiInputResponse {
  input: string;
  type: string;
  timestamp: string;
  command_logs: string;
  interactive_feedback: string;
}

export interface CommandExecutionRequest {
  sessionId: string;
  command: string;
}

export interface PromptEnhancementRequest {
  sessionId: string;
  originalPrompt: string;
}

export interface SubmitRequest {
  sessionId: string;
  input: string;
  type?: string;
  commandLogs?: string;
}
