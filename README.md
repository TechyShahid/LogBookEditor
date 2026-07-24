# LogBook Editor

LogBook Editor is a lightweight, Notepad++-style text editor built with plain HTML, CSS, and JavaScript, and packaged as a desktop application with Electron. It is designed to feel familiar for users who want a simple editor with multi-tab support, file handling, find/replace tools, a status bar, and theme switching.

## Overview
LogBook Editor provides a clean, minimal interface for creating and editing text files. It supports working with multiple documents at once through tabs, preserving content in each tab until the user saves it, and includes common editing features expected in a modern text editor.

## Main Features
- Multiple tabbed documents
- New document creation with a dedicated new-tab button
- Open files from disk
- Save the current document
- Save as a new file
- Save all modified tabs
- Find and replace text
- Line numbers and live cursor position information
- Word count in the status bar
- Dark and light theme toggle
- Keyboard shortcuts for common actions
- Desktop packaging for macOS

## Keyboard Shortcuts
- Ctrl/Cmd + N: create a new tab
- Ctrl/Cmd + O: open a file
- Shift + Ctrl/Cmd + O: open a file in a new tab
- Ctrl/Cmd + S: save the current document
- Shift + Ctrl/Cmd + S: save all modified documents
- Ctrl/Cmd + F: open the find/replace panel

## Project Structure
- index.html: main application layout
- styles.css: visual styling and responsive layout
- app.js: editor logic, tabs, file handling, search, and status updates
- desktop-app.js: Electron entry point for desktop application packaging
- package.json: scripts and dependencies
- appdmg.json: configuration for creating a macOS DMG installer

## Run Locally
Install dependencies and launch the app:

```bash
npm install
npm start
```

This starts the Electron desktop app.

## Run the Web Version
If you want to preview the editor in a browser instead of the desktop app, run:

```bash
python3 -m http.server 8000
```

Then open http://127.0.0.1:8000 in your browser.

## Build a macOS Desktop App
To build a macOS app bundle for Intel:

```bash
npx electron-packager . LogBookEditor --platform=darwin --arch=x64 --overwrite
```

To build a macOS app bundle for Apple Silicon:

```bash
npx electron-packager . LogBookEditor --platform=darwin --arch=arm64 --overwrite
```

## Create a macOS DMG Installer
To create a disk image installer:

```bash
npx appdmg appdmg.json LogBookEditor.dmg
```

## Installation on macOS
1. Open the generated .dmg file
2. Drag the app into the Applications folder
3. Open it from Applications

If macOS shows a security warning, right-click the app and choose Open, then confirm.

## Notes
- The application is currently focused on a lightweight editor experience rather than full IDE features.
- Saving files downloads them as text files through the browser-style save flow used by the app.
- The app is suitable for personal notes, quick code edits, and lightweight text editing tasks.

## Future Improvements
Possible enhancements include:
- Syntax highlighting for programming languages
- Word wrap and line ending options
- Find-in-files and replace-in-files
- File explorer sidebar
- Auto-save support
- Drag-and-drop tab management
