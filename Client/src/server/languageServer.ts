import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { htmlCompletions } from '../utils/codeCompletions/html';
import { cssCompletions } from '../utils/codeCompletions/css';
import { jsCompletions } from '../utils/codeCompletions/javascript';

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 创建文档管理器
const documents = new TextDocuments(TextDocument);

// 监听文档变化
documents.onDidChangeContent(change => {
  const text = change.document.getText();
  const languageId = change.document.languageId;
  
  // 根据语言类型获取对应的代码提示
  let completions;
  switch(languageId) {
    case 'html':
      completions = htmlCompletions({ state: null, pos: 0 } as any);
      break;
    case 'css':
      completions = cssCompletions({ state: null, pos: 0 } as any);
      break;
    case 'javascript':
      completions = jsCompletions({ state: null, pos: 0 } as any);
      break;
  }
  
  // 发送代码提示给客户端
  if(completions) {
    connection.sendNotification('custom/completions', {
      uri: change.document.uri,
      completions
    });
  }
});

// 监听连接初始化
connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: 1, // TextDocumentSyncKind.Incremental
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['.', '<', '"', ' ', ':', '@']
      }
    }
  };
});

// 启动服务器
documents.listen(connection);
connection.listen();