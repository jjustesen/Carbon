"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('Your extension "my-extension" is now active!');
    let disposable = vscode.commands.registerCommand("my-extension.showFileName", () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const fileName = vscode.workspace.asRelativePath(editor.document.uri);
            //le o arquivo atual e exibe os imports que contem no arquivo
            let text = editor.document.getText();
            let lines = text.split("\n");
            let imports = lines.filter((line) => line.includes("import"));
            console.log(imports);
            // vscode.window.showInformationMessage(`Current file: ${fileName}`);
        }
        else {
            vscode.window.showInformationMessage("No file is currently open.");
        }
    });
    vscode.window.registerTreeDataProvider("myExtensionView", MyTreeDataProvider);
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);
    context.subscriptions.push(myStatusBarItem);
    updateStatusBar(context);
    context.subscriptions.push(disposable);
}
function deactivate() { }
let myStatusBarItem;
function updateStatusBar(context) {
    myStatusBarItem.text = `Hello world`;
    myStatusBarItem.tooltip = "Click to show the current file name";
    myStatusBarItem.show();
}
const MyTreeDataProvider = {
    getTreeItem(element) {
        return element;
    },
    getChildren(element) {
        return Promise.resolve(this.getItems());
    },
    getItems() {
        const items = [];
        items.push(createMyTreeItem("Item 1"));
        items.push(createMyTreeItem("Item 2"));
        return items;
    },
};
function createMyTreeItem(label) {
    const item = new vscode.TreeItem(label);
    item.tooltip = `Tooltip for ${label}`;
    item.description = `Description for ${label}`;
    return item;
}
//# sourceMappingURL=extension.js.map