// Vídeos MP4 já gravados (media/videos/<id da história>.<pt|en>.mp4), gerados por scripts/render-videos.mjs.
// O player animado funciona para todas as histórias; o MP4 é para baixar e compartilhar.
const trilhaPhp = ['php-oop-abstract-interface-trait', 'php-comparison-money', 'laravel-request-lifecycle', 'lab-idempotency',
  'payments-card-lifecycle', 'db-indexes-explain', 'lab-lost-update', 'sec-owasp-web', 'docker-php-dev-env', 'git-workflow-conflicts',
  'clean-architecture-php', 'solid-all-five', 'ddd-core-concepts', 'lab-tdd', 'k8s-core-concepts'];

export const videos = new Set([]); // liga quando os MP4 estiverem gravados: trilhaPhp.map((id) => `${id}.pt`)
