import typescript from './typescript.js';
import react from './react.js';
import node from './node.js';
import api from './api.js';
import databases from './databases.js';
import messaging from './messaging.js';
import architecture from './architecture.js';
import principles from './principles.js';
import testing from './testing.js';
import devops from './devops.js';
import observability from './observability.js';
import security from './security.js';
import php from './php.js';
import agile from './agile.js';
import { rubrics } from './rubrics.js';

const all = [
  ...typescript, ...react, ...node, ...api, ...databases, ...messaging,
  ...architecture, ...principles, ...testing, ...devops, ...observability, ...security, ...php, ...agile,
];

// Cada pergunta recebe sua rubrica (pontos obrigatórios, ferramentas, métricas).
export const questions = all.map((q) => ({
  ...q,
  points: rubrics[q.id]?.points ?? [],
  tools: rubrics[q.id]?.tools ?? [],
  metrics: rubrics[q.id]?.metrics ?? [],
}));
