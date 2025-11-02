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
	const config = vscode.workspace.getConfiguration('templatr');
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
	const config = vscode.workspace.getConfiguration('templatr');

	if (!fs.existsSync(templatesDir)) {
		vscode.window.showWarningMessage('No .templates folder found in workspace.');
		return;
	}

	const templates = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
	if (templates.length === 0) {
		vscode.window.showWarningMessage('No templates found in .templates folder.');
		return;
	}

	// Ask user to choose a template
	const picked = await vscode.window.showQuickPick(templates, {
		placeHolder: 'Select a template to create a new file from'
	});
	if (!picked) return;

	// Always require a title
	const title = await vscode.window.showInputBox({
		prompt: 'Enter the title for this note (used as filename and ${title} variable):',
		ignoreFocusOut: true
	});
	if (!title) {
		vscode.window.showWarningMessage('File creation cancelled (no title provided).');
		return;
	}

	// Load template content
	const templatePath = path.join(templatesDir, picked);
	let content = fs.readFileSync(templatePath, 'utf8');

	// Prepare variables
	const vars = getVariableMap(workspacePath);
	vars.title = title; // always include title

	content = await applyVariablesAsync(content, vars);

	// Determine file destination
	const folderSetting = config.get('outputFolder') || 'notes';
	const fileExtension = config.get('defaultFileExtension') || 'md';
	const targetDir = path.join(workspacePath, folderSetting);
	ensureDir(targetDir);

	// File name = title.md (spaces converted to underscores)
	const safeTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_');
	const filePath = path.join(targetDir, `${safeTitle}.${fileExtension}`);

	// Write and open file
	fs.writeFileSync(filePath, content);
	const document = await vscode.workspace.openTextDocument(filePath);
	vscode.window.showTextDocument(document);

	if (config.get('showNotifications')) {
		vscode.window.showInformationMessage(`Created note: ${safeTitle}.${fileExtension}`);
	}
}

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('templatr.createFromTemplate', createFromTemplate),
		vscode.commands.registerCommand('templatr.newTemplate', createNewTemplate)
	);
}

function deactivate() {}

module.exports = { activate, deactivate };
