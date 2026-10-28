import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

const root = resolve('src');
function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
  );
}
const files = walk(root).filter(
  (file) =>
    /\.(ts|tsx)$/.test(file) &&
    !/\.test\.(ts|tsx)$/.test(file) &&
    !relative(root, file).startsWith(`test${sep}`),
);
const fileSet = new Set(files);
const name = (file: string) => relative(root, file).split(sep).join('/');
const graph = new Map(
  files.map((file) => {
    const imports = ts.preProcessFile(readFileSync(file, 'utf8')).importedFiles;
    const dependencies = imports.flatMap(({ fileName }) => {
      if (!fileName.startsWith('.')) return [];
      const base = resolve(dirname(file), fileName);
      const dependency = [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')].find(
        (candidate) => fileSet.has(candidate),
      );
      return dependency ? [dependency] : [];
    });
    return [file, dependencies] as const;
  }),
);

it('mantém shared independente, features isoladas e entradas públicas na aplicação', () => {
  const violations: string[] = [];
  for (const [file, dependencies] of graph) {
    const source = name(file);
    for (const dependency of dependencies) {
      const target = name(dependency);
      const sameFeature = source.split('/')[1] === target.split('/')[1];
      const invalidShared = source.startsWith('shared/') && !target.startsWith('shared/');
      const invalidApp =
        source.startsWith('app/') &&
        target.startsWith('features/') &&
        !/^features\/[^/]+\/index\.ts$/.test(target);
      const invalidFeature =
        source.startsWith('features/') &&
        (target.startsWith('app/') || (target.startsWith('features/') && !sameFeature));
      if (invalidShared || invalidApp || invalidFeature) violations.push(`${source} → ${target}`);
    }
  }
  expect(violations).toEqual([]);
});

it('não contém dependências circulares entre módulos da aplicação', () => {
  const visited = new Set<string>();
  const active = new Set<string>();
  function visit(file: string, chain: string[]) {
    if (active.has(file))
      throw new Error(`Dependência circular: ${[...chain, name(file)].join(' → ')}`);
    if (visited.has(file)) return;
    active.add(file);
    for (const dependency of graph.get(file) ?? []) visit(dependency, [...chain, name(file)]);
    active.delete(file);
    visited.add(file);
  }
  for (const file of files) visit(file, []);
  expect(visited.size).toBe(files.length);
});
