# 💎 O coração e a casca

> A empresa decidiu migrar de CodeIgniter pra Laravel. Metade do time entrou em pânico. A regra de negócio, não.

## 🎭 Elenco
- 💎 **Coração** · as entidades e regras de domínio (`Fatura::pagar()`) · "fatura paga não se paga de novo"
- 🎬 **Maestro** · o caso de uso `PagarFatura` · orquestra: busca, manda pagar, salva e avisa
- 🔌 **Tomada** · a interface (porta) `FaturaRepository` · "alguém que guarda faturas", sem dizer como
- 🧰 **Eloquent** · `EloquentFaturaRepository` (adaptador) · implementa a tomada falando com o banco
- 🚪 **Recepcionista** · o controller · traduz HTTP em chamada de caso de uso, sem regra nenhuma
- ⬇️ **Lei da gravidade** · a regra da dependência · tudo aponta pra dentro; o de dentro nunca conhece o de fora
- 🧪 **Teste** · teste de unidade do caso de uso · roda sem banco, com um repositório em memória
- 📝 **Cadastro simples** · um CRUD · não precisa de tudo isso

- 🏢 **Empresa** · quem decide a migração
- 😱 **Time** · os devs · com medo de quebrar tudo
- 👩‍🏫 **Arquiteta experiente** · quem sabe onde vale a pena a arquitetura
## 🎬 Cena 1 · Quem manda em quem
**Coração**: "Eu sou o centro do sistema. Não quero saber de Laravel, SQL Server nem HTTP. Só sei que fatura paga não se paga de novo." 💎
**Maestro**: "Eu busco a fatura, peço pra ela se pagar, salvo e aviso quem precisa. Mas só conheço tomadas: 'alguém que guarda faturas', 'alguém que publica eventos'." 🎬
**Eloquent**: "Eu sou um desses 'alguéns'. Me pluga na tomada." 🧰
**Recepcionista**: "E eu só traduzo o pedido HTTP. Regra? Aqui não, querida." 🚪
**Lei da gravidade**: "Todo mundo aponta PRA DENTRO. O de fora conhece o de dentro; o de dentro nunca conhece o de fora." ⬇️
= 💎 Domínio importa: nada de framework
= 🎬 Caso de uso depende de: `FaturaRepository` (interface)
= 🧰 Implementação: `EloquentFaturaRepository`
= ⬇️ Direção das dependências: de fora para dentro

## 🎬 Cena 2 · A mudança de framework
**Empresa**: "Vamos sair do CodeIgniter pro Laravel!"
**Time**: "SOCORRO, VAI QUEBRAR TUDO!" 😱
**Coração**: "Pode ir, eu vou junto sem mudar uma linha. Só troca a casca." 😎
**Teste**: "E eu testo a regra em milissegundos, sem subir banco. Tô nem aí pro framework." 🧪
= 🔄 Framework: CodeIgniter → Laravel
= 💎 Linhas mudadas no domínio: 0 ✅
= 🧰 O que muda: controllers e adaptadores
= 🧪 Teste do caso de uso: sem banco, em milissegundos

## 🎬 Cena 3 · Sem exagero
**Cadastro simples**: "Eu também preciso de quatro camadas, interface e adaptador?"
**Arquiteta experiente**: "Não, meu anjo. Clean Architecture onde a regra é rica, tipo pagamento e fatura. No resto, simples." 😅
= 💳 Pagamentos e faturas: Clean Architecture (regra rica)
= 📝 Cadastro simples: controller + model direto (CRUD)

## 💻 Traduzindo pro código
```php
// 💎 domínio: não importa nada de framework
final class Fatura {
    public function pagar(Money $valor): void {
        if ($this->status === Status::Paga) throw new FaturaJaPaga();
        $this->status = Status::Paga;
    }
}

// 🔌 porta
interface FaturaRepository { public function buscar(int $id): Fatura; public function salvar(Fatura $f): void; }

// 🎬 caso de uso
final class PagarFatura {
    public function __construct(private FaturaRepository $faturas) {}
    public function executar(int $id, Money $valor): void {
        $fatura = $this->faturas->buscar($id);
        $fatura->pagar($valor);
        $this->faturas->salvar($fatura);
    }
}

// 🧰 adaptador (infraestrutura)
final class EloquentFaturaRepository implements FaturaRepository { /* usa o Eloquent aqui dentro */ }
```

| Camada | Conhece | Exemplo |
| --- | --- | --- |
| Domínio | Nada de fora | `Fatura`, `Money` |
| Aplicação (casos de uso) | Domínio e portas | `PagarFatura` |
| Adaptadores | Aplicação e o mundo | Controller, `EloquentFaturaRepository` |
| Frameworks e drivers | Tudo | Laravel, SQL Server |

## 🎤 Pra entrevista
"Clean Architecture é a regra da dependência: domínio e casos de uso no centro, sem conhecer framework, banco ou HTTP; a infraestrutura implementa interfaces, as portas, e o controller só traduz HTTP. Ganho testabilidade e posso trocar de framework sem reescrever a regra. Aplico onde o domínio é rico, como pagamentos; em CRUD simples, mantenho simples."
