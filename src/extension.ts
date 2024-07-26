import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('A extensão "minha-extensao" está ativa!');

  const treeDataProvider = createFileTreeDataProvider();
  vscode.window.registerTreeDataProvider("fileExplorer", treeDataProvider);

  // Atualiza a árvore quando o arquivo aberto mudar
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      treeDataProvider.refresh();
    }
  });
}

export function deactivate() {}

function createFileTreeDataProvider(): vscode.TreeDataProvider<FileItem> {
  const onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();

  const getTreeItem = (element: FileItem): vscode.TreeItem => {
    return createFileItem(element.filePath);
  };

  const getChildren = (element?: FileItem): Thenable<FileItem[]> => {
    if (element) {
      return Promise.resolve([]);
    } else {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const filePath = editor.document.fileName;
        const text = editor.document.getText();
        const lines = text.split("\n");
        const imports = lines.filter((line) => line.includes("import"));

        return Promise.resolve(imports.map((line) => createFileItem(line)));
      } else {
        return Promise.resolve([]);
      }
    }
  };

  return {
    onDidChangeTreeData: onDidChangeTreeData.event,
    getTreeItem,
    getChildren,
    refresh: () => {
      onDidChangeTreeData.fire();
    },
  };
}

interface FileItem extends vscode.TreeItem {
  filePath: string;
}

function createFileItem(filePath: string): FileItem {
  const item: FileItem = {
    label: filePath,
    tooltip: filePath,
    description: filePath,
    filePath: filePath,
    collapsibleState: vscode.TreeItemCollapsibleState.None,
  };

  return item;
}
