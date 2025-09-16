# 🚀 Guía de Despliegue - Omega Testing

Esta guía proporciona instrucciones detalladas para desplegar Omega Testing en diferentes plataformas.

## 📋 Tabla de Contenidos

- [Preparación](#preparación)
- [Vercel](#vercel)
- [Railway](#railway)
- [Servidor VPS/Cloud](#servidor-vpscloud)
- [Docker](#docker)
- [GitHub Pages](#github-pages)
- [Solución de Problemas](#solución-de-problemas)

## 🛠️ Preparación

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- Cuenta en la plataforma de despliegue elegida

### Verificar el Build Local

Antes de desplegar, asegúrate de que el proyecto construye correctamente:

```bash
# Instalar dependencias
npm install

# Verificar tipos
npm run typecheck

# Ejecutar tests
npm run test

# Construir el proyecto
npm run build:client

# Verificar que la carpeta dist/spa fue creada
ls -la dist/spa
```



## ⚡ Vercel

### Despliegue desde Git

1. **Crear cuenta en [Vercel](https://vercel.com)**

2. **Importar proyecto**

   - Clic en "New Project"
   - Importar desde GitHub/GitLab/Bitbucket

3. **Configurar Build**

   ```
   Framework Preset: Vite
   Build Command: npm run build:client
   Output Directory: dist/spa
   Install Command: npm install
   ```

4. **Variables de entorno** (si es necesario)
   - Agregar en el dashboard de Vercel

### Despliegue con CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Construir
npm run build:client

# Desplegar
vercel --prod

# Configurar el proyecto (primera vez)
vercel
```

## 🚄 Railway

Railway es excelente para aplicaciones full-stack.

### Despliegue desde Git

1. **Crear cuenta en [Railway](https://railway.app)**

2. **Nuevo proyecto**

   - "New Project" → "Deploy from GitHub repo"
   - Seleccionar repositorio

3. **Configurar variables**

   ```
   BUILD_COMMAND=npm run build
   START_COMMAND=npm start
   ```

4. **Configurar puerto**
   Railway asigna automáticamente el puerto mediante la variable `PORT`

### Con CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Desplegar
railway up
```

## 🖥️ Servidor VPS/Cloud

Para despliegue en tu propio servidor (Ubuntu/Debian).

### Configuración del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Subir y Configurar la Aplicación

```bash
# En tu servidor, clonar el repositorio
git clone <tu-repositorio-url> Omega Testing
cd Omega Testing

# Instalar dependencias
npm install

# Construir la aplicación
npm run build

# Configurar PM2
pm2 start dist/server/node-build.mjs --name Omega Testing
pm2 startup
pm2 save
```

### Configurar Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/Omega Testing
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Servir archivos estáticos
    location / {
        root /path/to/Omega Testing/dist/spa;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/Omega Testing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker

### Dockerfile

Crear `Dockerfile` en la raíz del proyecto:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Docker Compose

Crear `docker-compose.yml`:

```yaml
version: "3.8"

services:
  Omega Testing:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - Omega Testing
    restart: unless-stopped
```

### Comandos Docker

```bash
# Construir imagen
docker build -t Omega Testing .

# Ejecutar contenedor
docker run -p 3000:3000 Omega Testing

# Con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f Omega Testing

# Actualizar
docker-compose pull
docker-compose up -d --force-recreate
```

## 📄 GitHub Pages

Para despliegue estático únicamente (sin funciones serverless).

### Configuración

1. **Habilitar GitHub Pages**

   - Ir a Settings → Pages
   - Source: GitHub Actions

2. **Crear workflow** `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:client

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/spa

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🔧 Solución de Problemas

### Errores Comunes

#### Error de Build

```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser >= 18
```

#### Error de Memoria

```bash
# Aumentar memoria para el build
NODE_OPTIONS="--max-old-space-size=4096" npm run build:client
```

#### Rutas no funcionan después del despliegue

Asegúrate de que tu servidor está configurado para servir `index.html` para rutas no encontradas (SPA fallback).

### Variables de Entorno

Crear `.env` para configuraciones específicas:

```env
# Ejemplo de variables
VITE_API_URL=https://api.tu-dominio.com
VITE_APP_NAME=Omega Testing
VITE_VERSION=1.0.0
```

### Verificación Post-Despliegue

```bash
# Verificar que el sitio responde
curl -I https://tu-sitio.com

# Verificar rutas SPA
curl -I https://tu-sitio.com/dashboard

# Verificar recursos estáticos
curl -I https://tu-sitio.com/assets/index.css
```

## 📊 Monitoreo

### Métricas Básicas

- **Tiempo de carga**: < 3 segundos
- **First Contentful Paint**: < 1.5 segundos
- **Lighthouse Score**: > 90

### Herramientas de Monitoreo


- **Vercel Analytics** (si usas Vercel)
- **Google Analytics**
- **Sentry** para errores

## 🔐 Consideraciones de Seguridad

### Headers de Seguridad

Agregar en tu servidor/CDN:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS

- Siempre usar HTTPS en producción
- Configurar redirección automática HTTP → HTTPS
- Usar certificados SSL válidos

---

## 📝 Notas Finales

- **Backup**: Configura backups automáticos de tu aplicación
- **Monitoreo**: Implementa logging y alertas
- **Updates**: Mantén dependencias actualizadas
- **Performance**: Optimiza imágenes y assets

Para soporte adicional, consulta la documentación oficial de cada plataforma de despliegue.
