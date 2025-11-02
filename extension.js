const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Built-in + user variables
 */
function getVariableMap(workspacePath) {
	const config = vscode.workspace.getConfiguration('notesFileGenerator');
	const userVars = config.get('variables') || {};

	const builtInVars = {
		ISODate: new Date().toISOString().split('T')[0],
		date: new Date().toLocaleString(),
		timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
		workspaceName: path.basename(workspacePath),
	};

	return { ...builtInVars, ...userVars };
}

/**
 * Extract ${var} placeholders
 */
function extractVariables(content) {
	const matches = [...content.matchAll(/\$\{(\w+)\}/g)];
	return [...new Set(matches.map(m => m[1]))];
}

/**
 * Prompt for missing vars
 */
async function resolveVariables(vars, templateVars) {
	const resolved = { ...vars };
	for (const key of templateVars) {
		if (!(key in resolved)) {
			const value = await vscode.window.showInputBox({
				prompt: `Enter a value for ${key}:`,
				ignoreFocusOut: true
			});
			resolved[key] = value || `\${${key}}`;
		}
	}
	return resolved;
}

/**
 * Apply variable replacements
 */
async function applyVariablesAsync(content, vars) {
	const templateVars = extractVariables(content);
	const fullVars = await resolveVariables(vars, templateVars);
	return content.replace(/\$\{(\w+)\}/g, (_, key) =>
		key in fullVars ? fullVars[key] : `\${${key}}`
	);
}

/**
 * Command: Create new template
 */
async function createNewTemplate() {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		vscode.window.showErrorMessage('Open a workspace first.');
		return;
	}

	const workspacePath = workspaceFolders[0].uri.fsPath;
	const templatesDir = path.join(workspacePath, '.templates');
	ensureDir(templatesDir);

	const templateName = await vscode.window.showInputBox({
		prompt: 'Enter new template name (e.g., meeting_minutes.md)',
	});
	if (!templateName) return;

	const templatePath = path.join(templatesDir, templateName);
	if (!fs.existsSync(templatePath)) {
		fs.writeFileSync(templatePath, '');
		vscode.window.showInformationMessage(`Created ${templateName} in .templates`);
	}

	const document = await vscode.workspace.openTextDocument(templatePath);
	vscode.window.showTextDocument(document);
}

/**
 * Command: Create file from selected template
 */
async function createFromTemplate() {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		vscode.window.showErrorMessage('Open a workspace first.');
		return;
	}

	const workspacePath = workspaceFolders[0].uri.fsPath;
	const templatesDir = path.join(workspacePath, '.templates');
	const config = vscode.workspace.getConfiguration('notesFileGenerator');

	if (!fs.existsSync(templatesDir)) {
		vscode.window.showWarningMessage('No .templates folder found in workspace.');
		return;
	}

	const templates = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
	if (templates.length === 0) {
		vscode.window.showWarningMessage('No templates found in .templates folder.');
		return;
	}

	const picked = await vscode.window.showQuickPick(templates, {
		placeHolder: 'Select a template to create a new file from'
	});
	if (!picked) return;

	const templatePath = path.join(templatesDir, picked);
	const folderSetting = config.get('outputFolder') || 'notes';
	const fileExtension = config.get('defaultFileExtension') || 'md';

	const targetDir = path.join(workspacePath, folderSetting);
	ensureDir(targetDir);

	const vars = getVariableMap(workspacePath);
	let content = fs.readFileSync(templatePath, 'utf8');
	content = await applyVariablesAsync(content, vars);

	const timestamp = vars.timestamp;
	const fileName = `${picked.replace('.md', '')}-${timestamp}.${fileExtension}`;
	const filePath = path.join(targetDir, fileName);

	fs.writeFileSync(filePath, content);

	const document = await vscode.workspace.openTextDocument(filePath);
	vscode.window.showTextDocument(document);

	if (config.get('showNotifications')) {
		vscode.window.showInformationMessage(`Created new file from template: ${picked}`);
	}
}

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('templator.createFromTemplate', createFromTemplate),
		vscode.commands.registerCommand('templator.newTemplate', createNewTemplate)
	);
}

function deactivate() {}

module.exports = { activate, deactivate };
