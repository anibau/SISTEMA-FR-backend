# 🚀 Guía de Instalación - Francachela Backend

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 o **yarn** >= 1.22.0
- **PostgreSQL** >= 13.0
- **Git**

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/anibau/SISTEMA-FR-backend.git
cd SISTEMA-FR-backend
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=francachela_user
DATABASE_PASSWORD=tu_password_seguro
DATABASE_NAME=francachela_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# Aplicación
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Opcional: Configuraciones adicionales
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Configurar base de datos PostgreSQL

#### Opción A: Instalación local
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Windows: Descargar desde https://www.postgresql.org/download/windows/
```

#### Opción B: Docker (Recomendado para desarrollo)
```bash
docker run --name francachela-postgres \
  -e POSTGRES_DB=francachela_db \
  -e POSTGRES_USER=francachela_user \
  -e POSTGRES_PASSWORD=tu_password_seguro \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Crear la base de datos
```sql
-- Conectar a PostgreSQL como superusuario
psql -U postgres

-- Crear usuario y base de datos
CREATE USER francachela_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE francachela_db OWNER francachela_user;
GRANT ALL PRIVILEGES ON DATABASE francachela_db TO francachela_user;
```

### 6. Ejecutar migraciones y semillas
```bash
# Ejecutar migraciones (crear tablas)
npm run migration:run

# Ejecutar semillas (datos iniciales)
npm run seed
```

### 7. Iniciar la aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🔐 Usuarios por Defecto

Después de ejecutar las semillas, tendrás estos usuarios disponibles:

### Administrador
- **Email:** admin@francachela.com
- **Contraseña:** admin123
- **Rol:** Administrador

### Vendedor
- **Email:** vendedor@francachela.com
- **Contraseña:** vendedor123
- **Rol:** Vendedor

## 📚 Documentación API

Una vez iniciada la aplicación, puedes acceder a:

- **API Base:** http://localhost:3000/api/v1
- **Documentación Swagger:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/api/v1/health

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo
npm run start:debug        # Iniciar con debugger

# Producción
npm run build              # Compilar aplicación
npm run start:prod         # Iniciar en producción

# Base de datos
npm run migration:generate # Generar nueva migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir última migración
npm run seed              # Ejecutar semillas

# Calidad de código
npm run lint              # Linter
npm run format            # Formatear código
npm run test              # Tests
```

## 🌐 Configuración para Producción

### Variables de entorno adicionales
```env
NODE_ENV=production
DATABASE_SSL=true
JWT_SECRET=un_secret_muy_seguro_para_produccion
CORS_ORIGIN=https://tu-frontend-domain.com
```

### Configuración de proxy reverso (Nginx)
```nginx
server {
    listen 80;
    server_name api.francachela.com;

    location / {
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

### PM2 para gestión de procesos
```bash
npm install -g pm2

# Crear archivo ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U francachela_user -d francachela_db
```

### Error de permisos
```bash
# Dar permisos al usuario
sudo chown -R $USER:$USER /path/to/project
```

### Puerto en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>
```

## 📞 Soporte

Para soporte técnico o reportar bugs:

- **Email:** soporte@francachela.com
- **GitHub Issues:** https://github.com/anibau/SISTEMA-FR-backend/issues
- **Documentación:** http://localhost:3000/docs

## 🔄 Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

¡Listo! Tu backend de Francachela debería estar funcionando correctamente. 🎉

