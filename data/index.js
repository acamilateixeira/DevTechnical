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
import phpFintech from './php-fintech.js';
import research from './research.js';
import walletDefense from './wallet-defense.js';
import backendFinance from './backend-finance.js';
import backendQuality from './backend-quality.js';
import { rubrics } from './rubrics.js';
import { extraJobs, reported } from './evidence.js';

const all = [
  ...typescript, ...react, ...node, ...api, ...databases, ...messaging,
  ...architecture, ...principles, ...testing, ...devops, ...observability, ...security, ...php, ...agile, ...phpFintech, ...research, ...walletDefense, ...backendFinance, ...backendQuality,
];

// Cada pergunta recebe sua rubrica (pontos obrigatórios, ferramentas, métricas).
export const questions = all.map((q) => ({
  ...q,
  jobs: [...new Set([...q.jobs, ...(extraJobs[q.id] || [])])],
  reported: q.reported ?? reported[q.id],
  points: rubrics[q.id]?.points ?? [],
  tools: rubrics[q.id]?.tools ?? [],
  metrics: rubrics[q.id]?.metrics ?? [],
}));
