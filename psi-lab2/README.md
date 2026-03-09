# Práctica 2 - Proyecto de Sistemas Informáticos

**Universidad Autónoma de Madrid · Departamento de Informática**

Aplicación de gestión de personas: frontend en **Vue.js 3** y backend **Django** (API REST). Los datos se persisten en PostgreSQL (Neon.tech) y la aplicación está desplegada en Render.com.

---

## URLs de despliegue

- **Frontend (Vue.js):** https://two-tutorial-vue-99-2311-2026-1.onrender.com/
- **Backend (Django API):** https://two-persona-99-2311-2026-2.onrender.com/
- **Base de datos:** PostgreSQL en [Neon.tech](https://neon.tech). URL de conexión:
  ```
  postgresql://neondb_owner:npg_18JaiRzBuHqE@ep-young-cloud-agf8cy2h-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```

Admin Django: `https://two-persona-99-2311-2026-2.onrender.com/admin/` (usuario **alumnodb**, contraseña **alumnodb**).

---

## Estructura del repositorio

```
psi-lab2/
├── README.md
├── requirements.txt
├── tutorial-vue/
│   ├── cypress/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   └── ...
│   ├── .env.development
│   ├── .env.production
│   └── package.json
└── persona/
    ├── persona/
    ├── api/
    ├── manage.py
    ├── build.sh
    └── .env
```

---

## Ejecución en local

### Backend (Django)

1. Desde la raíz del repo:
   ```bash
   cd persona
   ```
2. Instalar dependencias:
   ```bash
   pip install -r ../requirements.txt
   ```
3. Crear `persona/.env` con `DATABASE_URL` (o dejar sin definir para BD local).
4. Migraciones y servidor:
   ```bash
   python manage.py migrate
   python manage.py runserver 8001
   ```
   API: `http://localhost:8001/api/v1/personas/`.

### Frontend (Vue.js)

1. Desde la raíz del repo:
   ```bash
   cd tutorial-vue
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Lanzar en desarrollo:
   ```bash
   npm run dev
   ```
   App en `http://localhost:5173`.
4. Lanzar en producción:
   ```bash
   npm run build
   ```
5. Tests Cypress (desde `tutorial-vue`):
   - Modo gráfico: `npx cypress open` (elegir E2E y el navegador).
   - Línea de comandos: `npx cypress run`.
   - Usar tests **static** si no hay API; **dynamic** cuando la app usa el API (Django).
   - Para tests contra un solo spec: `npx cypress run --spec cypress/e2e/dynamic-01-initial-check.cy.js` (o el que corresponda).

---

## Variables de entorno

- **Django (`persona/.env`):** `DATABASE_URL`, `RENDER_EXTERNAL_HOSTNAME` (hostname de Render para ALLOWED_HOSTS).
- **Vue (`tutorial-vue/.env.development` y `.env.production`):** `VITE_DJANGOURL` (URL del API). Para Cypress, en `.env.development`: `VITE_LOCAL` (`1` = baseUrl local, `0` = baseUrl Render), `VITE_DEV_BASE_URL` (localhost:5173), `VITE_PROD_BASE_URL` (URL del frontend en Render).