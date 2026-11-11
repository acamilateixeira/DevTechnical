# 🏛️ A viagem de uma requisição pelo prédio do Laravel

> Uma requisição chega na porta: `POST /faturas/10/pagar`. Ela vai passar por um prédio inteiro até virar resposta.

## 🎭 Elenco
- ✉️ **Requisição** · `POST /faturas/10/pagar` · a visitante
- 🚪 **Portaria** · `public/index.php` · a porta de entrada; acorda o Laravel
- 🧰 **Zeladores** · service providers · arrumam o prédio: banco, filas, rotas e o cadastro no container
- 👮 **Catracas** · middlewares (`auth`, `throttle`) · "tá logada? não tá abusando?"
- 🗺️ **Mapa** · o router · descobre pra qual sala ela vai
- 🧪 **Fiscal da sala** · Form Request · valida os dados e confere se ela PODE pagar essa fatura
- 🤵 **Mordomo** · o service container · monta as dependências e entrega pro controller
- 🎤 **Atendente** · o controller · chama o caso de uso e devolve a resposta
- 🐌 **Eloquent distraído** · consulta N+1 · uma query pra lista e mais uma por item
- 🧺 **Cesta** · `with('cliente')` (eager loading) · busca tudo junto

- 🚨 **Laravel em dev** · `Model::preventLazyLoading()` · grita quando alguém carrega relação preguiçosamente
## 🎬 Cena 1 · Entrando no prédio
**Requisição**: "Cheguei! Quero pagar a fatura 10." ✉️
**Portaria**: "Bem-vinda! Deixa eu acordar o Laravel." 🚪
**Zeladores**: "Já arrumamos tudo: banco, filas, rotas, e registramos no mordomo quem é quem." 🧰
**Catracas**: "Tá logada? Tá. Não tá mandando pedido demais? Não. Pode passar." 👮
**Mapa**: "Pagar fatura? Sala do `PagamentoController`, método `store`." 🗺️

## 🎬 Cena 2 · Na sala
**Fiscal da sala**: "Antes de falar com o atendente: o valor veio certo? A fatura é sua? Então pode." 🧪
**Mordomo**: "O atendente precisa do `PagarFatura`? Montei e tá aqui." 🤵
**Atendente**: "Paguei! Toma o 201." 🎤
**Requisição**: "E agora volto pelas mesmas catracas até a saída." 📬

## 🎬 Cena 3 · O distraído
**Eloquent distraído**: "Listando 50 faturas com o cliente… uma query pra lista… mais uma pro cliente da 1… mais uma pro da 2…" 🐌
**Cesta**: "Para com isso! Me pede junto: 2 queries e pronto." 🧺
**Laravel em dev**: "E eu ainda grito se alguém tentar carregar preguiçosamente." 🚨

## 💻 Traduzindo pro código
```php
// routes/api.php
Route::post('/faturas/{fatura}/pagar', [PagamentoController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:pagamentos']);                      // 👮

// 🧪 Form Request
final class PagarFaturaRequest extends FormRequest {
    public function authorize(): bool { return $this->user()->can('pagar', $this->route('fatura')); }
    public function rules(): array { return ['valor_centavos' => ['required', 'integer', 'min:1']]; }
}

// 🎤 Controller com 🤵 injeção
public function store(PagarFaturaRequest $req, Fatura $fatura, PagarFatura $useCase) {
    $useCase->executar($fatura->id, Money::of($req->integer('valor_centavos')));
    return response()->json(['ok' => true], 201);
}

// 🧺 sem N+1
$faturas = Fatura::with('cliente')->latest()->paginate(50);
Model::preventLazyLoading(! app()->isProduction());                               // 🚨
```

## 🎤 Pra entrevista
"A requisição entra pelo `public/index.php`, os service providers registram os serviços, passa pelos middlewares globais e de rota, o router acha o controller, o Form Request valida e autoriza, o container injeta as dependências no controller e a resposta volta pelos middlewares. No Eloquent, evito N+1 com `with()` e ligo o `preventLazyLoading()` em desenvolvimento."
