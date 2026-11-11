# 🐱 O gatinho, a fatura do vizinho e o apóstrofo

> Três golpes clássicos contra um site de banco. Todos começam com alguém muito simpático.

## 🎭 Elenco
- 👩 **Bia** · a usuária logada no banco · só queria ver foto de gato
- 🐱 **Site do gatinho** · site malicioso · por baixo da foto, manda o navegador fazer um pedido pro banco
- 🍪 **Cookie de sessão** · o login da Bia · o navegador leva junto em todo pedido pro banco
- 🛑 **Cookie desconfiado** · `SameSite=Lax` · não vai junto em pedido que vem de outro site
- 🎫 **Senha do formulário** · token CSRF · código que só o site do banco conhece
- 🤔 **Curioso** · usuário trocando o número na URL · tenta `/faturas/124`
- 🛂 **Conferente** · checagem de dono no servidor · "essa fatura é sua?"
- 💉 **Apóstrofo malandro** · `' OR '1'='1` · texto que tenta virar comando SQL
- 📦 **Envelope lacrado** · prepared statement · o texto vai separado do comando

- 🏦 **Banco** · o site do banco · obedece a qualquer pedido com o cookie certo
- 🕳️ **API sem conferente** · endpoint sem checagem de dono · entrega o que pedirem
- 🧵 **Query colada com `+`** · SQL montado concatenando texto · obedece ao apóstrofo
## 🎬 Cena 1 · O gatinho (CSRF)
**Bia**: "Que gatinho fofo! 🐱"
**Site do gatinho** _(por baixo da foto)_: "Navegador, manda um POST `/transferir` pro banco dela!"
**Cookie de sessão**: "Tá, eu vou junto, como sempre…" 🍪
**Banco**: "Pedido com o cookie da Bia? Transferido!" 💸
> 🚨 O banco não sabia que o pedido veio de outro site.
**Cookie desconfiado**: "Comigo não: pedido vindo de OUTRO site, eu fico em casa." 🛑
**Senha do formulário**: "E o banco ainda exige um código que só o site do banco tem. O gatinho não sabe." 🎫

## 🎬 Cena 2 · A fatura do vizinho (IDOR)
**Curioso**: "Minha fatura é `/faturas/123`… e se eu tentar `/faturas/124`?" 🤔
**API sem conferente**: "Toma a 124!" _(é da Dona Neusa do 302)_
**Conferente**: "Peraí. A 124 é sua? Não? Então 404, não existe pra você." 🛂

## 🎬 Cena 3 · O apóstrofo (SQL injection)
**Apóstrofo malandro**: "Busca o cliente `' OR '1'='1`." 💉
**Query colada com `+`**: "Devolvo… TODOS OS CLIENTES DO BANCO!" 💥
**Envelope lacrado**: "Comigo o texto vai lacrado, separado do comando. Procuro literalmente alguém chamado `' OR '1'='1`. Ninguém. Próximo." 📦

## 💻 Traduzindo pro código
```php
// 💉 ❌ concatenado            📦 ✅ parametrizado
$db->query("SELECT * FROM clientes WHERE nome = '" . $_GET['nome'] . "'");
$stmt = $pdo->prepare('SELECT * FROM clientes WHERE nome = :nome');
$stmt->execute(['nome' => $_GET['nome']]);

// 🛂 IDOR: busca SEMPRE pelo dono
$fatura = Fatura::where('id', $id)->where('cliente_id', auth()->id())->firstOrFail(); // 404 se não for dela
```
```http
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax    # 🛑
```

| Ataque | Defesa principal |
| --- | --- |
| CSRF | `SameSite`, token CSRF, nada que muda estado em `GET` |
| IDOR (controle de acesso quebrado) | Checar o dono do recurso no servidor |
| SQL injection | Prepared statements / ORM |
| XSS | Escapar na saída, CSP (→ lab XSS) |

## 🎤 Pra entrevista
"O que mais checo: controle de acesso por recurso no servidor, porque IDOR é o número 1 do OWASP Top 10; queries parametrizadas contra injeção; CSRF com cookie `SameSite` e token; XSS escapando na saída e com CSP; segredos fora do front e dependências atualizadas."
