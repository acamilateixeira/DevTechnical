export default [
  {
    id: 'sec-owasp-web',
    cat: 'security', type: 'concept', jobs: ['elastic', 'brainrocket', 'frontend'],
    tags: ['OWASP', 'XSS', 'CSRF', 'SQL injection', 'IDOR', 'CSP', 'dangerouslySetInnerHTML'],
    q: {
      pt: 'O React já protege contra XSS? Quais vulnerabilidades do OWASP Top 10 você mais checa em code review numa aplicação full stack?',
      en: 'Does React already protect against XSS? Which OWASP Top 10 vulnerabilities do you check most in code review for a full stack app?',
    },
    a: {
      pt: `O React **escapa** o que é interpolado em JSX, então \`{userInput}\` é seguro. Mas há brechas: \`dangerouslySetInnerHTML\` sem sanitizar (use DOMPurify), URLs \`javascript:\` em \`href\`, injeção em atributos via spread de props vindas do usuário, e bibliotecas que manipulam o DOM direto. **Content Security Policy** é a defesa em profundidade.

O que mais checo em review:

- **Broken access control / IDOR** (o nº 1 do OWASP): \`GET /invoices/123\` verifica se a fatura pertence ao usuário? Autorização no servidor em cada recurso, nunca só esconder botão no front.
- **Injeção**: queries parametrizadas ou ORM; nunca concatenar SQL. Inclui NoSQL injection (\`{ $gt: '' }\` no Mongo) e command injection.
- **CSRF**: com cookie de sessão, \`SameSite=Lax/Strict\` + token CSRF em mutações.
- **Dados sensíveis**: segredos fora do código e do bundle do front (tudo no front é público), logs sem senha/token/documento, HTTPS e HSTS.
- **Validação na fronteira**: schema (Zod, class-validator, Form Request) em todo input; limite de tamanho de payload.
- **Dependências vulneráveis**: Dependabot/\`npm audit\`, lockfile, atenção a supply chain.
- **SSRF** quando o servidor busca URLs informadas pelo usuário.
- Rate limiting em login e endpoints caros.`,
      en: `React **escapes** what you interpolate in JSX, so \`{userInput}\` is safe. But there are gaps: unsanitized \`dangerouslySetInnerHTML\` (use DOMPurify), \`javascript:\` URLs in \`href\`, attribute injection via spreading user-controlled props, and libraries that touch the DOM directly. **Content Security Policy** is defense in depth.

What I check most in review:

- **Broken access control / IDOR** (OWASP #1): does \`GET /invoices/123\` check the invoice belongs to the user? Server-side authorization on every resource, never just hiding a button.
- **Injection**: parameterized queries or an ORM; never concatenated SQL. That includes NoSQL injection (\`{ $gt: '' }\` in Mongo) and command injection.
- **CSRF**: with session cookies, \`SameSite=Lax/Strict\` plus a CSRF token on mutations.
- **Sensitive data**: secrets out of code and out of the frontend bundle (everything on the frontend is public), logs without passwords/tokens/IDs, HTTPS and HSTS.
- **Boundary validation**: schemas (Zod, class-validator, Form Requests) on every input; payload size limits.
- **Vulnerable dependencies**: Dependabot/\`npm audit\`, lockfiles, supply-chain awareness.
- **SSRF** when the server fetches user-supplied URLs.
- Rate limiting on login and expensive endpoints.`,
    },
    follow: [
      { pt: 'JWT no localStorage ou cookie httpOnly? Por quê?', en: 'JWT in localStorage or an httpOnly cookie? Why?' },
      { pt: 'Como você revogaria um JWT antes de expirar?', en: 'How would you revoke a JWT before it expires?' },
    ],
    flags: {
      pt: '"Uso React, então não tenho XSS." Ou validar permissão só no front.',
      en: '"I use React, so I have no XSS." Or checking permissions only on the frontend.',
    },
    anchor: {
      pt: 'Bora: políticas no PostgreSQL controlam acesso pelo vínculo no órgão e o segredo do push fica no Vault (fora do código). TripFlow: escopo por empresa + testes de isolamento (proteção contra IDOR entre tenants). Em sistemas financeiros na Sicoob, segurança é requisito do dia a dia.',
      en: 'Bora: PostgreSQL policies control access by department membership and the push secret lives in Vault (outside the code). TripFlow: company scoping + isolation tests (protection against cross-tenant IDOR). In financial systems at Sicoob, security is a daily requirement.',
    },
  },
  {
    id: 'sec-auth-jwt-oauth',
    cat: 'security', type: 'architecture', jobs: ['brainrocket', 'elastic'],
    tags: ['authentication', 'authorization', 'JWT', 'OAuth 2.0', 'OIDC', 'refresh token', 'PKCE', 'RBAC'],
    q: {
      pt: 'Como você desenha autenticação e autorização para uma SPA React + API Node? Fale de JWT, sessões, OAuth/OIDC e refresh tokens.',
      en: 'How do you design authentication and authorization for a React SPA + Node API? Talk about JWT, sessions, OAuth/OIDC, and refresh tokens.',
    },
    a: {
      pt: `**Autenticação** (quem é) ≠ **autorização** (o que pode fazer).

- **Sessão com cookie**: o servidor guarda o estado; o cookie \`httpOnly\`, \`Secure\`, \`SameSite\` carrega só o ID. Revogação imediata, simples e seguro para apps no mesmo domínio.
- **JWT**: token assinado e autocontido, sem consulta ao banco a cada requisição. Bom entre serviços. Problemas: não dá para revogar antes de expirar sem uma denylist, e o payload é só codificado (base64), não criptografado. Validar assinatura, \`exp\`, \`aud\`, \`iss\` e fixar o algoritmo (nunca aceitar \`alg: none\`).
- **Access token curto (5–15 min) + refresh token** rotativo, guardado em cookie \`httpOnly\`, com detecção de reuso (se um refresh antigo for usado, revoga a família inteira).
- **OAuth 2.0** é delegação de acesso; **OIDC** adiciona identidade (ID token) por cima. Para SPA, o fluxo é **Authorization Code + PKCE** (o implicit flow está obsoleto). Muitas vezes o melhor é um **BFF**: o back-end faz o OAuth e o browser só recebe um cookie de sessão, sem token exposto ao JavaScript.

**Autorização**: RBAC (papéis) para o grosso, ABAC/políticas para regras contextuais ("o gestor aprova viagens do próprio centro de custo até X"), sempre checada no servidor, centralizada (policies/guards) e testada.`,
      en: `**Authentication** (who you are) ≠ **authorization** (what you may do).

- **Cookie session**: the server keeps the state; an \`httpOnly\`, \`Secure\`, \`SameSite\` cookie carries only the ID. Instant revocation, simple and safe for same-site apps.
- **JWT**: a signed, self-contained token, no database lookup per request. Good between services. Problems: it cannot be revoked before expiry without a denylist, and the payload is only encoded (base64), not encrypted. Validate signature, \`exp\`, \`aud\`, \`iss\`, and pin the algorithm (never accept \`alg: none\`).
- **Short access token (5–15 min) + rotating refresh token** in an \`httpOnly\` cookie, with reuse detection (if an old refresh token is used, revoke the whole family).
- **OAuth 2.0** is access delegation; **OIDC** adds identity (the ID token) on top. For SPAs the flow is **Authorization Code + PKCE** (the implicit flow is obsolete). Often the best option is a **BFF**: the backend does OAuth and the browser only gets a session cookie, with no token exposed to JavaScript.

**Authorization**: RBAC (roles) for the bulk, ABAC/policies for contextual rules ("a manager approves trips from their own cost center up to X"), always enforced on the server, centralized (policies/guards), and tested.`,
    },
    follow: [
      { pt: 'Onde você guardaria o access token numa SPA sem BFF?', en: 'Where would you keep the access token in an SPA without a BFF?' },
      { pt: 'Como funciona SSO entre o Salesforce e uma aplicação própria?', en: 'How does SSO work between Salesforce and an in-house application?' },
    ],
    flags: {
      pt: 'Colocar dados sensíveis no payload do JWT achando que está criptografado. Ou access token de 30 dias.',
      en: 'Putting sensitive data in the JWT payload thinking it is encrypted. Or a 30-day access token.',
    },
    anchor: {
      pt: 'Bora usa Supabase Auth (JWT + RLS no PostgreSQL); Laravel tem Sanctum/Passport e policies; no Salesforce há perfis, permission sets e OAuth para integrações (Connected Apps). Cite o que você realmente configurou.',
      en: 'Bora uses Supabase Auth (JWT + PostgreSQL RLS); Laravel has Sanctum/Passport and policies; Salesforce has profiles, permission sets, and OAuth for integrations (Connected Apps). Mention what you actually configured.',
    },
  },
];
