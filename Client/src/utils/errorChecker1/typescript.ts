export interface CodeError {
  message: string;
  severity: 'error' | 'warning' | 'suggestion';
  from: number;
  to: number;
  line: number;
  column?: number;
  code?: string;
  source?: string;
  context?: string;
  category?: 'syntax' | 'semantic' | 'style' | 'type';
  codeSnippet?: string;
  endLine?: number;
  endColumn?: number;
  ruleId?: string;
  fixes?: Array<{
    description: string;
    edit: {
      from: number;
      to: number;
      text: string;
    };
  }>;
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
  // 新增字段
  documentationUrl?: string;
  recommendedFix?: string;
  affectedFiles?: string[];
  timestamp?: number;
  errorType?: 'compiler' | 'linter' | 'formatter' | 'type-checker' | 'other';
}

export interface ErrorCheckerOptions {
  [x: string]: any;
  ignorePatterns?: string[];
  severityLevel?: 'error' | 'warning' | 'suggestion' | 'all';
  includeSource?: boolean;
  maxErrors?: number;
  workingDirectory?: string;
  // 新增配置选项
  enableDocumentationLinks?: boolean;
  showAffectedFiles?: boolean;
  timeout?: number;
  cacheResults?: boolean;
  parallelProcessing?: boolean;
  customRules?: {
    name: string;
    pattern: string;
    severity: 'error' | 'warning' | 'suggestion';
  }[];
  // 类型检查相关配置
  typeCheck?: boolean;
  strict?: boolean;
  typeCheckOptions?: {
    strictNullChecks?: boolean;
    noImplicitAny?: boolean;
    strictFunctionTypes?: boolean;
    strictBindCallApply?: boolean;
    strictPropertyInitialization?: boolean;
    noImplicitThis?: boolean;
    alwaysStrict?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    noImplicitReturns?: boolean;
    noFallthroughCasesInSwitch?: boolean;
  };
}

export type ErrorChecker = (
  code: string,
  options?: ErrorCheckerOptions
) => Promise<{
  map(
    arg0: (error: any) => any
  ): readonly import('@codemirror/lint').Diagnostic[] | PromiseLike<readonly import('@codemirror/lint').Diagnostic[]>;
  errors: CodeError[];
  diagnostics?: any;
  stats?: {
    errorCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}>;
