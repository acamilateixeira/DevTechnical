**Usuária** (logada no banco, abre outro site): "Que gatinho fofo! 🐱"

**Site malicioso**: *(por baixo do gatinho)* "Navegador, manda um POST `/transferir` pro banco dela!"

**Navegador**: "Tá, e eu levo o cookie de sessão junto, como sempre…" 🍪 **← CSRF**

**Cookie `SameSite`** 🛑: "Peraí: pedido vindo de OUTRO site? Eu não vou junto."

**Token CSRF** 🎫: "E o banco exige um código secreto que só o próprio site do banco conhece. O site do gatinho não tem."

**Usuária curiosa**: "Minha fatura é `/faturas/123`… e se eu tentar `/faturas/124`?" 🤔

**API sem checagem**: "Toma a fatura 124!" *(é de outra pessoa)* **← IDOR**

**API com checagem** 🛂: "A 124 é sua? Não. 404." ✅

**Formulário de busca**: "`' OR '1'='1`"

**Query concatenada**: "Devolvo TODOS os clientes!" 💥 **← SQL injection**

**Prepared statement** 💉🚫: "Comigo o texto vai separado do comando. Procuro literalmente por `' OR '1'='1`. Nada encontrado."

**🧠 Moral da história para entrevista**

"O que mais checo: controle de acesso por recurso no servidor (IDOR é o nº 1 do OWASP), queries parametrizadas contra injeção, CSRF com SameSite e token, XSS escapando na saída, segredos fora do front e dependências atualizadas."
