import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('A extensão "minha-extensao" está ativa!');

  const treeDataProvider = createFileTreeDataProvider();
  vscode.window.registerTreeDataProvider("fileExplorer", treeDataProvider);

  // Registra o comando para abrir o arquivo
  vscode.commands.registerCommand(
    "fileExplorer.openFile",
    (filePath: string) => {
      openFile(filePath);
    }
  );

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
        const fileName = path.basename(filePath, path.extname(filePath));

        //Encontra as formas de exportação do arquivo
        await vscode.workspace.fs
          .readFile(vscode.Uri.file(filePath))
          .then((content) => {
            console.log(filePath);
            const text = content.toString();

            //separa exportações default e export em const
            const exportRegexDefault = new RegExp(
              `export\\s+(default\\s+)?(function|class|const|let|var)\\s+${fileName}`
            );
            const exportRegexConst = new RegExp(
              `export\\s+const\\s+${fileName}`
            );
            const exportRegexFunction = new RegExp(
              `export\\s+function\\s+${fileName}`
            );
            const exportRegexClass = new RegExp(
              `export\\s+class\\s+${fileName}`
            );

            const exportDefault = exportRegexDefault.test(text);
          });

        const importers = await findImporters(fileName);
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
    command: {
      command: "fileExplorer.openFile",
      title: "Open File",
      arguments: [filePath],
    },
  };

  return item;
}

async function findImporters(fileName: string): Promise<string[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    return [];
  }

  const importers: string[] = [];
  for (const folder of workspaceFolders) {
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folder, "**/*.{js,ts,jsx,tsx,vue}"),
      "**/node_modules/**"
    );

    for (const file of files) {
      const content = await vscode.workspace.fs.readFile(file);
      const text = content.toString();

      // Atualizar a regex para capturar importações que incluam o nome do arquivo
      const importRegex = new RegExp(
        `import\\s+.*\\s+from\\s+['"].*${fileName}['"];?`
      );
      const matches = text.match(importRegex);
      console.log(matches);
      if (importRegex.test(text)) {
        importers.push(file.fsPath);
      }
    }
  }

  return importers;
}

async function openFile(filePath: string) {
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document);
}
