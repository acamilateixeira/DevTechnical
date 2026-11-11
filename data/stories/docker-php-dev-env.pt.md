**Dev nova no time**: "Como eu rodo o projeto?"

**Time sem Docker**: "Instala PHP 7.4… não, 8.1… a extensão X… o MySQL 5.7… e reza." 🙏

**Time com Docker** 🐳: "`docker compose up`. Pronto."

**Imagem** 📀: "Eu sou a receita congelada: sistema + PHP 8.3 + extensões. Igual em todo computador."

**Container** 📦: "E eu sou a receita rodando. Pode me apagar e me recriar quantas vezes quiser."

**Banco, sem volume**: "Apagaram meu container… perdi TODOS os dados!" 😱

**Volume** 💾: "Por isso os dados moram em mim, fora do container. O container vai e volta, eu fico."

**App PHP**: "Quero falar com o banco em `localhost`…"

**Rede do compose** 🕸️: "`localhost` é você mesmo, dentro do seu container! O banco se chama **`db`**, pelo nome do serviço."

**Nginx** 🚪: "Eu recebo o HTTP e passo os `.php` pro PHP-FPM executar."

**Xdebug** 🐞: "E eu fico só no ambiente de desenvolvimento, nunca na imagem de produção."

**🧠 Moral da história para entrevista**

"Imagem é a receita imutável; container é a imagem rodando; volume guarda o que precisa sobreviver; os serviços do compose se acham pelo nome. Com Docker, todo mundo roda o mesmo ambiente que produção, e o ambiente de dev é diferente da imagem de produção."
