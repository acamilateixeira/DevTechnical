# 🐳 "Na minha máquina funciona"

> Primeiro dia da dev nova no time de PHP. Ela pergunta como roda o projeto e todo mundo olha pro chão.

## 🎭 Elenco
- 🙋‍♀️ **Dev nova** · quem acabou de chegar · quer rodar o projeto hoje, não semana que vem
- 🙏 **Tutorial de 47 passos** · instalar tudo na mão · PHP certo, extensões, MySQL certo, e reza
- 📀 **Receita** · a imagem (`Dockerfile`) · sistema + PHP 8.3 + extensões, igual em todo computador
- 📦 **Bolo** · o container · a receita rodando; pode jogar fora e fazer outro
- 💾 **Pote da geladeira** · o volume · guarda os dados fora do container, pra sobreviver
- 🕸️ **Lista de ramais** · a rede do `docker compose` · cada serviço se acha pelo nome
- 🚪 **Porteiro** · Nginx · recebe o HTTP e passa os `.php` pro PHP-FPM
- 🐞 **Lupa** · Xdebug · só no ambiente de desenvolvimento, nunca na imagem de produção

- 🤷 **Colega** · o dev veterano · "na minha máquina funciona"
- 🗄️ **Banco** · o container do MySQL · onde os dados moram se ninguém der um volume
- 🐘 **App PHP** · o container da aplicação · precisa achar o banco
## 🎬 Cena 1 · Antes do Docker
**Dev nova**: "Como eu rodo o projeto?"
**Tutorial de 47 passos**: "Instala o PHP 7.4… não, 8.1… a extensão X… o MySQL 5.7, não o 8… e reza pra ninguém ter atualizado nada." 🙏
**Colega**: "Na minha máquina funciona." 🤷
= 🙏 Passos para rodar: 47, manuais
= 🤷 Ambiente: cada máquina de um jeito

## 🎬 Cena 2 · Com Docker
**Dev nova**: "`docker compose up`."
**Receita**: "Saindo o mesmo ambiente pra todo mundo, igualzinho ao de produção." 📀
**Bolo**: "Tô rodando! E se der ruim, me apaga e faz outro, sem dó." 📦
**Banco** _(sem pote)_: "Apagaram meu container… PERDI TODOS OS DADOS!" 😱
**Pote da geladeira**: "Por isso os dados moram em mim. O bolo vai e vem, eu fico." 💾
= 🐳 Comando: `docker compose up`
= 📦 Containers: app (PHP-FPM) · nginx · db (MySQL)
= 💾 Volume `dbdata`: os dados sobrevivem ao container ✅

## 🎬 Cena 3 · O localhost
**App PHP**: "Vou falar com o banco em `localhost`…"
**Lista de ramais**: "`localhost` é você mesmo, dentro do SEU container, minha filha! O banco é o ramal **`db`**." 🕸️
**App PHP**: "Ahhh. Faz sentido."
**Porteiro**: "E quem chega pela porta 80 sou eu que recebo e passo pro PHP." 🚪
**Lupa**: "E eu só apareço no dev. Em produção, nem me convida." 🐞
= 🕸️ `DB_HOST`: `db` (nome do serviço), não `localhost`
= 🚪 Porta: 8080 da máquina → 80 do Nginx
= 🐞 Xdebug: só na imagem de dev

## 💻 Traduzindo pro código
```yaml
# docker-compose.yml
services:
  app:                                   # 📦 PHP-FPM
    build: .                             # 📀 Dockerfile
    environment: { DB_HOST: db }         # 🕸️ o ramal, não localhost
    volumes: [ "./:/var/www/html" ]      # o código da sua máquina dentro do container
  nginx:                                 # 🚪
    image: nginx:1.27
    ports: [ "8080:80" ]
  db:
    image: mysql:8.0
    volumes: [ "dbdata:/var/lib/mysql" ] # 💾
volumes:
  dbdata:
```

| | Imagem | Container | Volume |
| --- | --- | --- | --- |
| É | A receita | A receita rodando | O pote de dados |
| Muda? | Não (imutável) | É descartável | Persiste |

## 🎤 Pra entrevista
"Imagem é a receita imutável; container é a imagem rodando, descartável; volume guarda o que precisa sobreviver; os serviços do compose se acham pelo nome, não por `localhost`. Com Docker todo mundo roda o mesmo ambiente de produção, e o ambiente de desenvolvimento, com Xdebug e código montado, é diferente da imagem de produção."
