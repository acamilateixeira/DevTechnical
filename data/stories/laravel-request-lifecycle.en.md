# 🏛️ A request's journey through the Laravel building

> A request arrives at the door: `POST /faturas/10/pagar`. It will pass through an entire building before becoming a response.

## 🎭 Cast
- ✉️ **Request** · `POST /faturas/10/pagar` · the visitor
- 🚪 **Front desk** · `public/index.php` · the entrance; wakes Laravel up
- 🧰 **Caretakers** · service providers · set up the building: database, queues, routes, and the container registry
- 👮 **Turnstiles** · middleware (`auth`, `throttle`) · "logged in? not overdoing it?"
- 🗺️ **Map** · the router · finds which room she's going to
- 🧪 **Room inspector** · Form Request · validates the data and checks she MAY pay this invoice
- 🤵 **Butler** · the service container · builds the dependencies and hands them to the controller
- 🎤 **Clerk** · the controller · calls the use case and returns the response
- 🐌 **Absent-minded Eloquent** · an N+1 query · one query for the list and one more per item
- 🧺 **Basket** · `with('cliente')` (eager loading) · fetches everything together

- 🚨 **Laravel in dev** · `Model::preventLazyLoading()` · yells when someone lazy-loads a relation
## 🎬 Scene 1 · Entering the building
**Request**: "I'm here! I want to pay invoice 10." ✉️
**Front desk**: "Welcome! Let me wake Laravel up." 🚪
**Caretakers**: "Everything's set up: database, queues, routes, and we registered who's who with the butler." 🧰
**Turnstiles**: "Logged in? Yes. Sending too many requests? No. Go ahead." 👮
**Map**: "Pay an invoice? The `PagamentoController` room, `store` method." 🗺️

## 🎬 Scene 2 · In the room
**Room inspector**: "Before you see the clerk: is the amount right? Is the invoice yours? Then go ahead." 🧪
**Butler**: "The clerk needs `PagarFatura`? Built it, here it is." 🤵
**Clerk**: "Paid! Here's your 201." 🎤
**Request**: "And now I go back out through the same turnstiles." 📬

## 🎬 Scene 3 · The absent-minded one
**Absent-minded Eloquent**: "Listing 50 invoices with their customer… one query for the list… another for invoice 1's customer… another for invoice 2's…" 🐌
**Basket**: "Stop that! Ask me for everything together: 2 queries and done." 🧺
**Laravel in dev**: "And I'll even yell if anyone tries to lazy-load." 🚨

## 💻 Translating to code
```php
// routes/api.php
Route::post('/faturas/{fatura}/pagar', [PagamentoController::class, 'store'])
    ->middleware(['auth:sanctum', 'throttle:pagamentos']);                      // 👮

// 🧪 Form Request
final class PagarFaturaRequest extends FormRequest {
    public function authorize(): bool { return $this->user()->can('pagar', $this->route('fatura')); }
    public function rules(): array { return ['valor_centavos' => ['required', 'integer', 'min:1']]; }
}

// 🎤 Controller with 🤵 injection
public function store(PagarFaturaRequest $req, Fatura $fatura, PagarFatura $useCase) {
    $useCase->executar($fatura->id, Money::of($req->integer('valor_centavos')));
    return response()->json(['ok' => true], 201);
}

// 🧺 no N+1
$faturas = Fatura::with('cliente')->latest()->paginate(50);
Model::preventLazyLoading(! app()->isProduction());                               // 🚨
```

## 🎤 For the interview
"The request enters through `public/index.php`, service providers register the services, it passes the global and route middleware, the router finds the controller, the Form Request validates and authorizes, the container injects the controller's dependencies, and the response goes back out through the middleware. In Eloquent I avoid N+1 with `with()` and turn on `preventLazyLoading()` in development."
