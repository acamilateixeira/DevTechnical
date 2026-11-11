# 🛒 O contrato, a planta e o kit

> O checkout de uma loja aceita Pix e cartão. Semana que vem chega o boleto. O checkout não quer nem saber.

## 🎭 Elenco
- 🛒 **Checkout** · o código que cobra · só quer alguém que saiba `cobrar()`
- 📜 **Contrato** · interface `MeioDePagamento` · quem assina PROMETE ter `cobrar()`; não diz como. Uma classe assina vários
- 🏗️ **Planta da casa** · classe abstrata `PagamentoComTaxa` · já vem com parte pronta; ninguém mora nela direto. Cada classe só tem UMA planta
- 🧩 **Kit pronto** · trait `RegistraLog` · pacote de métodos que qualquer classe "cola", mesmo sem parentesco
- ⚡ **Pix** · `class Pix implements MeioDePagamento` · cobra do jeito dele
- 💳 **Cartão** · `class CartaoDeCredito extends PagamentoComTaxa` · cobra do jeito dele, com taxa
- 🧾 **Boleto** · a classe nova que chega depois
- 🎭 **Camaleão** · polimorfismo · o mesmo código funcionando com classes diferentes

## 🎬 Cena 1 · O contrato
**Checkout**: "Eu só quero alguém que saiba cobrar. Pix, cartão, tanto faz." 🛒
**Contrato**: "Quem assinar comigo PROMETE ter `cobrar()`. Como vai cobrar é problema de cada um." 📜
**Pix**: "Assinei! Cobro na hora, sem taxa." ⚡
**Cartão**: "Também assinei!" 💳

## 🎬 Cena 2 · A planta e o kit
**Planta da casa**: "E eu já venho com metade pronta: calculo o total com taxa. Cada filho só diz QUAL taxa. Ninguém mora em mim direto, viu? Só nas casas feitas a partir de mim." 🏗️
**Cartão**: "Fui construído com essa planta. Só disse que minha taxa é 3%."
**Kit pronto**: "E eu sou um pacote de métodos de log que qualquer um cola, mesmo sem ser da família." 🧩
**Pix**: "Colei o kit e nem sou parente do Cartão. Chique."

## 🎬 Cena 3 · Chegou o boleto
**Boleto**: "Oi, gente! Posso entrar?" 🧾
**Checkout**: "Assinou o contrato? Então entra. Eu nem preciso mudar." 😎
**Camaleão**: "É isso: o checkout chama `cobrar()` e cada um responde do seu jeito." 🎭

## 💻 Traduzindo pro código
```php
interface MeioDePagamento { public function cobrar(int $centavos): Recibo; }        // 📜

abstract class PagamentoComTaxa implements MeioDePagamento {                         // 🏗️
    abstract protected function taxa(): float;
    public function cobrar(int $centavos): Recibo {
        return $this->processar((int) round($centavos * (1 + $this->taxa())));
    }
    abstract protected function processar(int $total): Recibo;
}

trait RegistraLog { public function log(string $msg): void { error_log(static::class . ": $msg"); } } // 🧩

final class Pix implements MeioDePagamento { use RegistraLog; public function cobrar(int $c): Recibo { /* ... */ } } // ⚡
final class CartaoDeCredito extends PagamentoComTaxa { protected function taxa(): float { return 0.03; } /* ... */ } // 💳

function finalizar(MeioDePagamento $meio, int $centavos) { return $meio->cobrar($centavos); } // 🛒 + 🎭
```

| | Interface | Classe abstrata | Trait |
| --- | --- | --- | --- |
| O que é | Contrato | Contrato + código comum | Pacote de métodos |
| Quantas por classe | Várias | Uma (herança única) | Várias |
| Pode instanciar? | Não | Não | Não |
| Use quando | Quer garantir um comportamento | Filhos dividem código e estado | Reuso entre classes sem parentesco |

## 🎤 Pra entrevista
"Interface é contrato, e uma classe pode implementar várias; classe abstrata é contrato com código comum, e só se herda de uma; trait é reuso horizontal de métodos entre classes sem parentesco. Polimorfismo é o mesmo código funcionando com classes diferentes que seguem o mesmo contrato, o que permite adicionar um meio de pagamento novo sem mexer em quem usa."
