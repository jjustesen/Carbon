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
const path = __importStar(require("path"));
function activate(context) {
    console.log('A extensão "minha-extensao" está ativa!');
    const treeDataProvider = createFileTreeDataProvider();
    vscode.window.registerTreeDataProvider("fileExplorer", treeDataProvider);
    // Registra o comando para abrir o arquivo
    vscode.commands.registerCommand("fileExplorer.openFile", (filePath) => {
        openFile(filePath);
    });
    // Atualiza a árvore quando o arquivo aberto mudar
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            treeDataProvider.refresh();
        }
    });
}
function deactivate() { }
function createFileTreeDataProvider() {
    const onDidChangeTreeData = new vscode.EventEmitter();
    const getTreeItem = (element) => {
        return createFileItem(element.filePath);
    };
    const getChildren = async (element) => {
        if (element) {
            return Promise.resolve([]);
        }
        else {
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
                    const exportRegexDefault = new RegExp(`export\\s+(default\\s+)?(function|class|const|let|var)\\s+${fileName}`);
                    const exportRegexConst = new RegExp(`export\\s+const\\s+${fileName}`);
                    const exportRegexFunction = new RegExp(`export\\s+function\\s+${fileName}`);
                    const exportRegexClass = new RegExp(`export\\s+class\\s+${fileName}`);
                    const exportDefault = exportRegexDefault.test(text);
                });
                const importers = await findImporters(fileName);
                return Promise.resolve(importers.map((importer) => createFileItem(importer)));
            }
            else {
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
function createFileItem(filePath) {
    const item = {
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
async function findImporters(fileName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return [];
    }
    const importers = [];
    for (const folder of workspaceFolders) {
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, "**/*.{js,ts,jsx,tsx,vue}"), "**/node_modules/**");
        for (const file of files) {
            const content = await vscode.workspace.fs.readFile(file);
            const text = content.toString();
            // Atualizar a regex para capturar importações que incluam o nome do arquivo
            const importRegex = new RegExp(`import\\s+.*\\s+from\\s+['"].*${fileName}['"];?`);
            const matches = text.match(importRegex);
            console.log(matches);
            if (importRegex.test(text)) {
                importers.push(file.fsPath);
            }
        }
    }
    return importers;
}
async function openFile(filePath) {
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document);
}
//# sourceMappingURL=extension.js.map