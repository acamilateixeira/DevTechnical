**`==`** 🤝 (o "tanto faz"): "`'1'` e `'01'`? Pra mim são iguais! `null` e `false`? Também!"

**`===`** 🧐 (o rigoroso): "Mesmo tipo E mesmo valor, senão não é igual. Em código de dinheiro, só eu."

**Float** 🎈: "Eu guardo 0,1… mais ou menos. `0.1 + 0.2` dá `0.30000000000000004`."

**Contador** 🧾: "Somei 1 milhão de transações e sumiram R$3,17. CADÊ?!" 😱

**Centavos inteiros** 🪙: "Eu guardo 10000 em vez de 100,00. Inteiro não tem erro de arredondamento."

**R$100 em 3 parcelas** ➗: "33,33 + 33,33 + 33,33 = 99,99… sumiu 1 centavo!"

**Parcelamento esperto**: "3334 + 3333 + 3333 = 10000. A primeira parcela fica com o centavo que sobrou." ✅

**Juros de 2,99%** 📈: "E eu?"

**bcmath** 🧮: "Eu faço a conta com decimais exatos e uma regra de arredondamento combinada com o negócio."

**🧠 Moral da história para entrevista**

"`==` converte tipos; `===` compara tipo e valor: em pagamentos, sempre estrito. Float não representa 0,1 exatamente, então dinheiro fica em centavos inteiros ou DECIMAL, contas com bcmath ou biblioteca de dinheiro, arredondamento explícito e parcelas que somam exatamente o total."
