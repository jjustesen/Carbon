import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

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

  const getChildren = async (element?: FileItem): Promise<FileItem[]> => {
    if (element) {
      return Promise.resolve([]);
    } else {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const filePath = editor.document.fileName;
        const importers = await findImporters(filePath);
        return Promise.resolve(
          importers.map((importer) => createFileItem(importer))
        );
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
    label: path.basename(filePath),
    tooltip: filePath,
    description: filePath,
    filePath: filePath,
    collapsibleState: vscode.TreeItemCollapsibleState.None,
  };

  return item;
}

async function findImporters(filePath: string): Promise<string[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return [];
  }

  const importers: string[] = [];
  for (const folder of workspaceFolders) {
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folder, "**/*.tsx"),
      "**/node_modules/**"
    );

    for (const file of files) {
      const content = await vscode.workspace.fs.readFile(file);
      const text = content.toString();
      const relativeFilePath = path
        .relative(folder.uri.fsPath, filePath)
        .replace(/\\/g, "/");
      const fileName = path.basename(relativeFilePath, ".tsx");
      console.log(fileName);

      const importRegex = new RegExp(
        `import\\s+.*\\s+from\\s+['"].*${fileName}['"];?`
      );

      // Use o regex para encontrar importações que terminam com o nome do arquivo
      // const matches = sourceCode.match(importRegex);
      if (importRegex.test(text)) {
        importers.push(file.fsPath);
      }
    }
  }

  return importers;
}
