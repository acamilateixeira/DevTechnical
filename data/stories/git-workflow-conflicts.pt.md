# 🌳 A árvore genealógica do código

> Segunda-feira você saiu da main pra fazer uma feature. Hoje é sexta. A main andou 20 commits sem você.

## 🎭 Elenco
- 🌳 **Main** · a branch principal · a linha oficial, o que vai pra produção
- 🌿 **Galhinho** · a sua feature branch · saiu da main e ficou pra trás
- 🤝 **Juntador** · `git merge` · junta as duas e registra "aqui se encontraram"; a história fica como aconteceu
- ✂️ **Reaplicador** · `git rebase` · pega seus commits e replanta em cima da main atual, em linha reta
- ⚔️ **Treta** · conflito · você e a Bia mexeram na MESMA linha
- 🚑 **Socorrista** · hotfix · sai da versão que está EM PRODUÇÃO pra corrigir urgente
- ↩️ **Desfazedor educado** · `git revert` · cria um commit novo que desfaz, sem apagar história
- 😈 **Trator** · `git push --force` na main · passa por cima do trabalho dos outros

- 👩‍💻 **Dev apressada** · você · quer que a sua versão ganhe
- 👩 **Bia** · a colega que mexeu na mesma linha
- 🧙 **Git** · o próprio Git · dá o conselho
- 🔥 **Produção** · o que está no ar
- 👥 **Time inteiro** · todo mundo em coro
## 🎬 Cena 1 · Atualizando o galhinho
**Galhinho**: "A main andou 20 commits e eu fiquei pra trás…" 🌿
**Juntador**: "Eu junto vocês e deixo registrado o encontro. Fica tudo como foi, com as bifurcações." 🤝
**Reaplicador**: "Eu pego seus commits e replanto em cima da main de hoje, como se você tivesse começado agora. Fica retinho." ✂️
**Reaplicador** _(baixinho)_: "Mas eu reescrevo a história, então só me usa no SEU galho, que ninguém mais usa."
= 🌿 Sua branch: 20 commits atrás da `main`
= 🤝 Com merge: +1 commit de merge; história com bifurcação
= ✂️ Com rebase: seus commits recriados em cima da `main`; linha reta

## 🎬 Cena 2 · A treta
**Treta**: "Você e a Bia mudaram a mesma linha. Quem ganha?" ⚔️
**Dev apressada**: "A minha, óbvio!"
**Git**: "Calma, fia! Lê o que a Bia quis fazer, conversa com ela, junta as duas intenções e roda os testes." 🗣️
**Bia**: "Obrigada por não apagar meu trabalho de novo." 😒
= ⚔️ Arquivo em conflito: `checkout.ts`, mesma linha
= 🗣️ Resolução: as duas intenções juntas, depois de falar com a Bia
= 🧪 Testes: passando ✅

## 🎬 Cena 3 · Pegou fogo
**Produção**: "BUG URGENTE NO CHECKOUT!" 🔥
**Socorrista**: "Saio da versão que tá EM PRODUÇÃO, não da develop, que tem coisa sem testar. Corrijo, publico e depois levo a correção de volta pra develop." 🚑
**Trator**: "Posso dar um `--force` na main pra limpar o histórico?" 😈
**Time inteiro**: "NÃAAO!"
**Desfazedor educado**: "Na branch compartilhada, quem desfaz sou eu: um commit novo que anula o outro, sem apagar nada de ninguém." ↩️
= 🚑 Hotfix sai de: a tag `v2.4.1` (o que está em produção)
= 🏷️ Publicado como: `v2.4.2`, depois merge de volta na develop
= ↩️ Desfazer em branch compartilhada: `git revert`, nunca `--force`

## 💻 Traduzindo pro código
```bash
# 🤝 merge: preserva a história
git switch feature/checkout && git merge main

# ✂️ rebase: história linear (só na SUA branch)
git switch feature/checkout && git rebase main
git push --force-with-lease          # nunca --force, nunca na main

# ⚔️ conflito
git status                            # vê os arquivos em conflito
# edita, junta as duas intenções, roda os testes
git add . && git rebase --continue

# 🚑 hotfix a partir do que está em produção
git switch -c hotfix/checkout v2.4.1
# ...corrige, PR, tag v2.4.2, depois merge de volta na develop/main

# ↩️ desfazer em branch compartilhada
git revert a1b2c3d
```

| | Merge | Rebase |
| --- | --- | --- |
| História | Como aconteceu (com bifurcações) | Linear |
| Reescreve commits? | Não | Sim |
| Onde usar | Branches compartilhadas | Só na sua branch |

## 🎤 Pra entrevista
"Merge preserva o histórico; rebase deixa linear mas reescreve, então só uso na minha branch, com `--force-with-lease`. Conflito eu resolvo entendendo a intenção das duas mudanças, falando com quem fez e rodando os testes. Hotfix sai da versão em produção e volta para a linha de desenvolvimento. Em branch compartilhada uso `revert`; `reset` só localmente."
