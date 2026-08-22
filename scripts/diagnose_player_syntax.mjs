import fs from "node:fs";
import ts from "typescript";
const path = "app/radio/[id].tsx";
const source = fs.readFileSync(path, "utf8");
const result = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true, fileName: path });
for (const diagnostic of result.diagnostics ?? []) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  const position = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
  console.log(`${position ? `${position.line + 1}:${position.character + 1}` : "?"} ${message}`);
}
if (!result.diagnostics?.length) console.log("No syntax diagnostics");
