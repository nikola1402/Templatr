# Templatr - Overview

A lightweight Visual Studio Code extension that lets you **generate new files from reusable templates**.  
Perfect for meeting notes, daily logs, tasks, reports, or any repeatable document structure.

![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visualstudiocode)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-0.2.0-orange)

---

## Features

**Create files from templates** stored in the `.templates/` folder  
**Dynamic template selection** via Command Palette  
**Per-template output folders** (customizable in settings)  
**Custom variables** (`${user}`, `${project}`, `${title}`, etc.)  
**Required `${title}` input** used for both filename and template content  
**Built-in variables** for date, timestamp, and workspace name  
**Quick template creation** via one command  

---

## Commands

| Command | Description |
|----------|--------------|
| **Templatr: Create From Template** | Lists all templates in `.templates/` and generates a new file from the one you pick. |
| **Templatr: Create New Template** | Opens a new file for creating a new template inside `.templates/`. |

---

## Settings

You can configure the extension from **Settings → Extensions → Templatr**,  
or directly in your workspace `.vscode/settings.json`.

### Example Configuration

```json
{
  "templatr.variables": {
    "user": "Bruce Wayne",
    "project": "Bat Framework"
  },
  "templatr.outputFolder": "notes",
  "templatr.templateFolders": {
    "note.md": "notes",
    "task.md": "tasks",
    "meeting_minutes.md": "meetings",
    "bug_report.md": "reports"
  },
  "templatr.defaultFileExtension": "md",
  "templatr.showNotifications": true
}
```
---
# User Guide

## Overview
The **Templatr** extension allows you to quickly create new Markdown files from reusable templates.  
You can store templates in a `.templates/` folder in your workspace, customize variables, and generate structured documents in seconds.

---

## Installation
1. Open Visual Studio Code.
2. Go to **Extensions** (`Ctrl+Shift+X`).
3. Search for **Templatr**.
4. Click **Install**.

---

## Quick Start

### Step 1: Create your first template
1. Open Command Palette: `Ctrl+Shift+P`
2. Run: **Templatr: Create New Template**
3. When prompted, enter a name (e.g. `meeting_minutes.md`)
4. Write your template content, e.g.:
   ```md
   # ${title}

   Author: ${user}
   Date: ${date}
   Project: ${project}
   ---
   ${content}
    ```
5. Save the file — it will be stored in `.templates/` inside your workspace.


### Step 2: Create a new file from a template

1. Open Command Palette: `Ctrl+Shift+P`
2. Run: `Templatr: Create From Template`
3. Select one of your templates.
4. You'll be asked to provide a filename
5. You’ll be asked to provide values for any missing variables.
6. The new file is created in the output folder (default: `notes/`).

Example result:
```md
# Weekly Sync

Author: Bruce Wayne  
Date: 10/28/2025, 22:50  
Project: Bat Framework  
---
Summary of discussion...
```

### Settings

You can customize behavior in:

`User Settings → File ▸ Preferences ▸ Settings ▸ Extensions ▸ Templatr`

or directly in your workspace `.vscode/settings.json file`.

Example:
```json
{
  "templatr.variables": {
    "user": "Bruce Wayne",
    "project": "Bat Framework"
  },
  "templatr.outputFolder": "workspace-notes",
  "templatr.defaultFileExtension": "md",
  "templatr.showNotifications": true
}
```

### Available Settings

Setting | Type | Default | Description
--- | --- | --- | ---
templatr.variables | object | { "user": "Anonymous" } | Key–value pairs for template variables
templatr.outputFolder | string | "notes" | Folder where generated files will be created
templatr.templateFolders | object | {} | Map templates to specific output folders (keys = template filenames, values = target folders)
templatr.defaultFileExtension | num | "md" | Default file extension (md, txt, markdown)
templatr.showNotifications | boolean | true | Whether to show info messages after creation

### Template Variables

You can use placeholders inside your templates using the ${variable} syntax.

Built-in Variables
Variable | Example | Description
--- | --- | ---
`${date}` | 10/28/2025, 22:52 | Local date and time
`${ISODate}` | 2025-10-28 | ISO date format
`${timestamp}` | 2025-10-28T22-52-33 | File-safe timestamp
`${workspaceName}` | MyProject | Current workspace folder name

### Custom Variables

Defined in settings.json under templatr.variables.

Example:
```json
"templatr.variables": {
  "user": "Bruce Wayne",
  "project": "Bat Framework"
}
```

You can then reference `${user}` and `${project}` inside templates.

### Interactive Prompts

If a variable is not found in either built-in or user-defined settings,
the extension will ask you for it when creating a file.

### Folder Structure

```
.your-workspace/
├── .templates/
│   ├── note.md
│   ├── task.md
│   ├── meeting_minutes.md
│   └── bug_report.md
│
├── notes/
│   └── Daily_Report.md
├── tasks/
│   └── Fix_Bug_42.md
└── meetings/
    └── Team_Sync.md

```

### Tips & Best Practices

* Use `.templates/` to store all template types (.md, .txt, etc.)
* Prefix variables with `${}` — plain text won’t be replaced.
* Use descriptive template names (`daily_report.md`, `meeting_summary.md`).
* Combine with VS Code snippets or shortcuts for faster workflows.
* Sync your `.templates/` folder in Git to share templates across projects.

### Troubleshooting
Problem | Possible Cause | Solution
--- | --- | ---
“No templates found” | .templates/ folder missing | Create a template using Templatr: Create New Template
Variables not replaced | Typo or undefined variable | Check spelling or add variable to settings
File not created | Workspace not open | Ensure a folder is opened in VS Code


## Feedback & Contributions

Issues and suggestions are welcome!
Open a GitHub issue or submit a pull request to contribute new features or improvements.

## License

Released under the MIT License.

© 2025 Nikola Puric