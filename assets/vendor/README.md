# Bibliotecas empacotadas (vendor)

Os labs rodam sem instalar nada e sem depender de CDN, então duas bibliotecas
estão empacotadas aqui como módulos ES:

| Arquivo | Conteúdo | Versão | Licença |
| --- | --- | --- | --- |
| `react.js` | `react` + `react-dom/client` (build de desenvolvimento, para mostrar os avisos do React no console) | 19.2.8 | MIT |
| `ts.js` | `typescript.transpileModule`, usado para transformar JSX/TypeScript em JavaScript no navegador | 6.0.3 | Apache-2.0 |

O `ts.js` só é baixado quando você abre um lab.

Como foram gerados (esbuild):

```bash
# react.js
echo "export * from 'react'; export { default } from 'react';
export { createRoot } from 'react-dom/client'; export { flushSync } from 'react-dom';" > react-all.js
esbuild react-all.js --bundle --format=esm --minify \
  --define:process.env.NODE_ENV='"development"' --outfile=react.js

# ts.js: exporta transpile(code) → { code, errors }
esbuild ts-entry.js --bundle --format=esm --minify --platform=browser --outfile=ts.js
```
