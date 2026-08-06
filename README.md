# Peculiar Hilado — Plataforma E-commerce

Tienda online de hilados teñidos a mano en Uruguay. Monorepo con backend, tienda y backoffice.

## Estructura

```
lanas/
├── lanas-backend/      # API Node.js + Express + PostgreSQL
├── lanas-store/        # Tienda pública (React + Vite)
├── lanas-backoffice/   # Panel de administración (React + Vite)
├── docker-compose.yml  # Base de datos local
└── package.json        # Scripts raíz para desarrollo
```

## URLs de producción

| Servicio     | URL                                                    |
|--------------|--------------------------------------------------------|
| Tienda       | https://lanas-store-production.up.railway.app          |
| Backoffice   | https://lanas-backoffice-production.up.railway.app     |
| Backend API  | https://lanas-production.up.railway.app                |

## Desarrollo local

**Requisitos:** Node.js 18+, Docker Desktop corriendo.

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Levantar todo (DB + backend + tienda + backoffice)
npm run dev
```

Esto levanta:
- PostgreSQL en Docker (`localhost:5432`)
- Backend en `http://localhost:4000`
- Tienda en `http://localhost:5173`
- Backoffice en `http://localhost:5174`

### Variables de entorno locales

`lanas-backend/.env`:
```
DATABASE_URL=postgresql://postgres:lanas123@localhost:5432/lanas_db
JWT_SECRET=
PORT=4000
```

`lanas-store/.env`:
```
VITE_API_URL=http://localhost:4000/api
```

`lanas-backoffice/.env`:
```
VITE_API_URL=http://localhost:4000/api
```

## Deploy a Railway

```bash
# Backend
railway up ./lanas-backend --path-as-root --service lanas

# Tienda
railway up ./lanas-store --path-as-root --service lanas-store

# Backoffice
railway up ./lanas-backoffice --path-as-root --service lanas-backoffice
```

## Stack

- **Backend:** Node.js, Express, PostgreSQL, JWT, Multer
- **Frontend:** React 18, Vite, React Router
- **Deploy:** Railway
- **DB local:** Docker + PostgreSQL 15
