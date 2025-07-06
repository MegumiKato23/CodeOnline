import * as prettier from 'prettier/standalone';
import * as htmlPlugin from 'prettier/plugins/html';
import * as cssPlugin from 'prettier/plugins/postcss';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree'; // 新增 estree 插件

type FormatOptions = {
  tabWidth?: number;
  useTabs?: boolean;
  printWidth?: number;
  singleQuote?: boolean;
  semi?: boolean;
  trailingComma?: 'none' | 'es5' | 'all';
  bracketSpacing?: boolean;
  arrowParens?: 'avoid' | 'always';
  bracketLine?: boolean;
  jsxBracketSameLine?: boolean;
};

const DEFAULT_OPTIONS: FormatOptions = {
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  bracketLine: false,
  jsxBracketSameLine: false,
};

const LANGUAGE_OPTIONS: Record<'html' | 'css' | 'js', FormatOptions> = {
  html: {
    printWidth: 100,
    bracketLine: true,
  },
  css: {
    printWidth: 100,
  },
  js: {
    printWidth: 100,
    trailingComma: 'es5',
    bracketLine: true,
  },
};

export const formatCode = async (
  code: string,
  type: 'html' | 'css' | 'js',
  options?: FormatOptions
): Promise<string> => {
  try {
    const formatOptions = {
      ...DEFAULT_OPTIONS,
      ...LANGUAGE_OPTIONS[type],
      ...options,
      parser: getParser(type),
      plugins: getPlugins(type),
    };

    if (!code.trim()) return code;

    return await prettier.format(code, formatOptions);
  } catch (e) {
    console.error(`格式化${type}代码失败:`, e);
    return code;
  }
};

function getParser(type: 'html' | 'css' | 'js'): string {
  switch (type) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
      return 'babel';
    default:
      return 'babel';
  }
}

function getPlugins(type: 'html' | 'css' | 'js'): any[] {
  const basePlugins = [babelPlugin, estreePlugin]; // 确保包含 estree 插件

  switch (type) {
    case 'html':
      return [...basePlugins, htmlPlugin];
    case 'css':
      return [...basePlugins, cssPlugin];
    case 'js':
      return basePlugins;
    default:
      return basePlugins;
  }
}
