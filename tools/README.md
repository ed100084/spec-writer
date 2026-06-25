# Tools

## Convert legacy `.doc` files to `.docx`

The web viewer parses `.docx` in the browser. Legacy `.doc` files are binary Word files and must be converted first.

Use the local converter on a Windows machine with Microsoft Word installed:

```powershell
# Convert one file
powershell -ExecutionPolicy Bypass -File .\tools\convert-doc-to-docx.ps1 -InputPath "D:\specs\sample.doc"

# Convert every .doc file in a folder into a docx subfolder
powershell -ExecutionPolicy Bypass -File .\tools\convert-doc-to-docx.ps1 -InputPath "D:\specs" -Recurse

# Convert into a specific output folder and replace existing .docx files
powershell -ExecutionPolicy Bypass -File .\tools\convert-doc-to-docx.ps1 -InputPath "D:\specs" -OutputPath "D:\specs-docx" -Recurse -Overwrite
```

Notes:

- Files stay local; the converter does not upload documents to a third-party service.
- Microsoft Word must be installed because conversion uses Word COM automation.
- The web app still exports review results as `.docx`.
