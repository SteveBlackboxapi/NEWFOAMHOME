import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';

/** Read build-time data using the same modules as the website, without running React. */
export function applicationData(root) {
  const require = createRequire(import.meta.url);
  const modules = new Map();
  return function load(relative) {
    const filename = path.resolve(root, relative);
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = { exports: {} };
    modules.set(filename, module);
    const source = readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', '"/"');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
    });
    new Function('require', 'module', 'exports', outputText)((specifier) => {
      if (!specifier.startsWith('.')) return require(specifier);
      const dependency = path.resolve(path.dirname(filename), specifier);
      return dependency === path.join(root, 'src/lib/assets') ? { A: '/assets' } : load(`${dependency}.ts`);
    }, module, module.exports);
    return module.exports;
  };
}
