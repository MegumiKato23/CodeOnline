import { ErrorChecker } from './typescript';
import { htmlChecker } from './htmlChecker';
import { cssChecker } from './cssChecker';
import { jsChecker } from './jsChecker';

interface LanguageCheckers {
  html: ErrorChecker;
  css: ErrorChecker;
  js: ErrorChecker;
}

const checkers: LanguageCheckers = {
  html: htmlChecker,
  css: cssChecker,
  js: jsChecker
};

export const createErrorChecker = (language: keyof LanguageCheckers): ErrorChecker => {
  return checkers[language] || (() => Promise.resolve({
    errors: [],
    diagnostics: [],
    stats: {
      errorCount: 0,
      warningCount: 0,
      suggestionCount: 0
    },
    map: (fn: (error: any) => any) => []
  }));
};

// 可选：添加默认导出（根据项目需求）
export default createErrorChecker;