export interface CodeError {
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
  from: number;
  to: number;
  line: number;
  column?: number;
  code?: string;
  source?: string;
  relatedInformation?: Array<{
    message: string;
    location: {
      file: string;
      line: number;
      column: number;
    };
  }>;
  fix?: {
    label: string;
    edit: Array<{
      from: number;
      to: number;
      insert: string;
    }>;
  };
}

export interface ErrorCheckerOptions {
  ignorePatterns?: string[];
  severityLevel?: 'error' | 'warning' | 'suggestion' | 'all';
  includeSource?: boolean;
  maxErrors?: number;
  workingDirectory?: string;
}

export type ErrorChecker = (
  code: string,
  options?: ErrorCheckerOptions
) => Promise<{
  map(arg0: (error: any) => any): readonly import("@codemirror/lint").Diagnostic[] | PromiseLike<readonly import("@codemirror/lint").Diagnostic[]>;
  errors: CodeError[];
  diagnostics?: any;
  stats?: {
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}>;