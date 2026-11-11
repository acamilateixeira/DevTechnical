# 🐳 "It works on my machine"

> The new dev's first day on the PHP team. She asks how to run the project and everyone stares at the floor.

## 🎭 Cast
- 🙋‍♀️ **New dev** · just arrived · wants to run the project today, not next week
- 🙏 **47-step tutorial** · installing everything by hand · the right PHP, extensions, the right MySQL, and a prayer
- 📀 **Recipe** · the image (`Dockerfile`) · OS + PHP 8.3 + extensions, identical on every computer
- 📦 **Cake** · the container · the recipe running; throw it away and bake another
- 💾 **Fridge container** · the volume · keeps data outside the container so it survives
- 🕸️ **Extension list** · the `docker compose` network · each service finds the others by name
- 🚪 **Doorman** · Nginx · receives HTTP and passes `.php` files to PHP-FPM
- 🐞 **Magnifying glass** · Xdebug · only in development, never in the production image

- 🤷 **Coworker** · the veteran dev · "it works on my machine"
- 🗄️ **Database** · the MySQL container · where data lives if nobody gives it a volume
- 🐘 **PHP app** · the application container · needs to find the database
## 🎬 Scene 1 · Before Docker
**New dev**: "How do I run the project?"
**47-step tutorial**: "Install PHP 7.4… no, 8.1… extension X… MySQL 5.7, not 8… and pray nobody updated anything." 🙏
**Coworker**: "It works on my machine." 🤷
= 🙏 Steps to run: 47, manual
= 🤷 Environment: every machine is different

## 🎬 Scene 2 · With Docker
**New dev**: "`docker compose up`."
**Recipe**: "Coming out the same environment for everyone, just like production." 📀
**Cake**: "I'm running! And if something breaks, delete me and bake another, no regrets." 📦
**Database** _(no fridge)_: "They deleted my container… I LOST ALL THE DATA!" 😱
**Fridge container**: "That's why data lives in me. The cake comes and goes; I stay." 💾
= 🐳 Command: `docker compose up`
= 📦 Containers: app (PHP-FPM) · nginx · db (MySQL)
= 💾 `dbdata` volume: data survives the container ✅

## 🎬 Scene 3 · The localhost
**PHP app**: "I'll talk to the database at `localhost`…"
**Extension list**: "`localhost` is you, inside YOUR own container, sweetie! The database is extension **`db`**." 🕸️
**PHP app**: "Ohhh. Makes sense."
**Doorman**: "And whoever comes in through port 80, I receive and pass to PHP." 🚪
**Magnifying glass**: "And I only show up in dev. In production, don't even invite me." 🐞
= 🕸️ `DB_HOST`: `db` (the service name), not `localhost`
= 🚪 Port: machine 8080 → Nginx 80
= 🐞 Xdebug: only in the dev image

## 💻 Translating to code
```yaml
# docker-compose.yml
services:
  app:                                   # 📦 PHP-FPM
    build: .                             # 📀 Dockerfile
    environment: { DB_HOST: db }         # 🕸️ the service name, not localhost
    volumes: [ "./:/var/www/html" ]      # your machine's code inside the container
  nginx:                                 # 🚪
    image: nginx:1.27
    ports: [ "8080:80" ]
  db:
    image: mysql:8.0
    volumes: [ "dbdata:/var/lib/mysql" ] # 💾
volumes:
  dbdata:
```

| | Image | Container | Volume |
| --- | --- | --- | --- |
| Is | The recipe | The recipe running | The data container |
| Changes? | No (immutable) | Disposable | Persists |

## 🎤 For the interview
"An image is the immutable recipe; a container is the image running, disposable; a volume keeps whatever must survive; compose services find each other by name, not by `localhost`. With Docker everyone runs the same environment as production, and the development setup, with Xdebug and mounted code, is different from the production image."
