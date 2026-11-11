**New dev on the team**: "How do I run the project?"

**Team without Docker**: "Install PHP 7.4… no, 8.1… extension X… MySQL 5.7… and pray." 🙏

**Team with Docker** 🐳: "`docker compose up`. Done."

**Image** 📀: "I'm the frozen recipe: OS + PHP 8.3 + extensions. Identical on every computer."

**Container** 📦: "And I'm the recipe running. Delete me and recreate me as often as you like."

**Database, without a volume**: "They deleted my container… I lost ALL the data!" 😱

**Volume** 💾: "That's why data lives in me, outside the container. The container comes and goes; I stay."

**PHP app**: "I want to reach the database at `localhost`…"

**Compose network** 🕸️: "`localhost` is you, inside your own container! The database is called **`db`**, after the service name."

**Nginx** 🚪: "I receive HTTP and pass the `.php` files to PHP-FPM to run."

**Xdebug** 🐞: "And I only exist in the development environment, never in the production image."

**🧠 Interview takeaway**

"An image is the immutable recipe; a container is the image running; a volume keeps what must survive; compose services find each other by name. With Docker everyone runs the same environment as production, and the dev setup differs from the production image."
