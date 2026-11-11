**Request** ✉️: "I'm here! `POST /invoices/10/pay`."

**`public/index.php`** 🚪 (the front desk): "Welcome! I'll wake Laravel up."

**Service providers** 🧰: "We've set everything up: database, queues, routes, and registered in the container who's who."

**Middlewares** 👮 (the turnstiles): "Logged in? (auth) Not sending too many requests? (throttle) Go ahead."

**Router** 🗺️: "`POST /invoices/{id}/pay`? That's for `PaymentController@store`."

**Form Request** 🧪: "Before the controller, I validate the data and check she MAY pay this invoice."

**Container** 🤵: "The controller needs `PayInvoice`? I build it and hand it over (dependency injection)."

**Controller**: "I call the use case and return 201."

**Response** 📬: "Heading back through the same turnstiles (middlewares) to the user."

**Eloquent** (inside the use case, listing 50 invoices with customers): "One query for the list… and one more per customer…" 😬

**`with('customer')`**: "Load it together: 2 queries." ✅

**🧠 Interview takeaway**

"`index.php` → service providers → global and route middleware → router → Form Request (validates and authorizes) → controller with dependencies injected by the container → the response goes back through the middleware. In Eloquent I avoid N+1 with `with()` and `preventLazyLoading()` in dev."
