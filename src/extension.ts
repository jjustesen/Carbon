import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "my-extension" is now active!');

  let disposable = vscode.commands.registerCommand(
    "my-extension.showFileName",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const fileName = vscode.workspace.asRelativePath(editor.document.uri);

        //le o arquivo atual e exibe os imports que contem no arquivo
        let text = editor.document.getText();
        let lines = text.split("\n");
        let imports = lines.filter((line) => line.includes("import"));
        console.log(imports);

        // vscode.window.showInformationMessage(`Current file: ${fileName}`);
      } else {
        vscode.window.showInformationMessage("No file is currently open.");
      }
    }
  );

  vscode.window.registerTreeDataProvider("myExtensionView", MyTreeDataProvider);

  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10000
  );
  context.subscriptions.push(myStatusBarItem);

  updateStatusBar(context);

  context.subscriptions.push(disposable);
}

export function deactivate() {}

let myStatusBarItem: vscode.StatusBarItem;

function updateStatusBar(context: vscode.ExtensionContext) {
  myStatusBarItem.text = `Hello world`;
  myStatusBarItem.tooltip = "Click to show the current file name";
  myStatusBarItem.show();
}

const MyTreeDataProvider = {
  getTreeItem(element: vscode.TreeItem) {
    return element;
  },

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    return Promise.resolve(this.getItems());
  },

  getItems(): vscode.TreeItem[] {
    const items: vscode.TreeItem[] = [];

    items.push(createMyTreeItem("Item 1"));
    items.push(createMyTreeItem("Item 2"));
    return items;
  },
};

function createMyTreeItem(label: string) {
  const item = new vscode.TreeItem(label);
  item.tooltip = `Tooltip for ${label}`;
  item.description = `Description for ${label}`;
  return item;
}
