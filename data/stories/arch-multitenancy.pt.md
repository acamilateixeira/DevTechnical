**Sistema SaaS** 🏢: "Atendo 500 empresas na mesma tabela de viagens, separadas por `tenant_id`."

**Dev com pressa**: "`SELECT * FROM viagens WHERE id = 10`" *(esqueceu o filtro de empresa)*

**Empresa A**: "Por que estou vendo a viagem da Empresa B?!" 😱 **← vazamento entre tenants**

**Escopo global do ORM** 🛡️: "Daqui pra frente, eu coloco `WHERE tenant_id = (empresa do usuário logado)` em TODA consulta. Ninguém precisa lembrar."

**Hacker** 🦹: "E se eu mandar `tenant_id=7` no body?"

**API**: "Eu ignoro. O tenant vem do usuário **autenticado**, nunca do que o cliente manda." 🙅

**Row Level Security (PostgreSQL)** 🔒: "E se mesmo assim o código esquecer, eu, o banco, barro a linha."

**Teste de isolamento** 🧪: "Eu crio dados de duas empresas e provo, em cada endpoint, que uma não vê a outra. Rodo em todo PR."

**Cache** 🗄️: "Opa, e eu? Se minha chave for `viagem:10` sem o tenant…" 😬

**Todos**: "TENANT NA CHAVE TAMBÉM!"

**🧠 Moral da história para entrevista**

"Com tabelas compartilhadas, a segurança não pode depender de lembrar o `WHERE`: escopo global no ORM a partir do usuário autenticado, RLS como defesa em profundidade, testes automatizados de isolamento e cuidado com vazamentos indiretos (cache, filas, logs, arquivos)."
