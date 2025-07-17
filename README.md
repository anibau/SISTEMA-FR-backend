# Sistema Francachela Backend 🍷

Backend completo para el sistema **Francachela - Tu tienda de licores**. API RESTful modular desarrollada con NestJS y PostgreSQL para gestionar una licorería moderna con POS táctil, delivery vía WhatsApp, promociones, multitickets y fidelización de clientes.

## 🚀 Características Principales

- **API RESTful completa** con NestJS y TypeORM
- **Autenticación JWT** con roles (administrador, vendedor)
- **18 módulos funcionales** organizados por dominio
- **POS táctil** con multitickets persistentes
- **Sistema de puntos** y fidelización de clientes
- **Delivery** con seguimiento de estados
- **Promociones dinámicas** por cantidad, monto y cumpleaños
- **Catálogo público** para consultas externas
- **Documentación automática** con Swagger
- **Auditoría completa** de acciones y cambios

## 🏗️ Arquitectura

### Módulos Implementados

1. **auth** - Autenticación JWT con roles
2. **usuarios** - Gestión de usuarios y permisos
3. **productos** - CRUD con búsqueda y carga masiva
4. **combos** - Paquetes de productos
5. **promociones** - Reglas dinámicas de descuentos
6. **ventas** - POS con multitickets
7. **cierres-caja** - Control de turnos
8. **gastos** - Registro por categorías
9. **clientes** - Gestión y validación
10. **puntos** - Sistema de fidelización
11. **delivery** - Seguimiento de pedidos
12. **catalogo** - Endpoint público
13. **notificaciones** - Alertas internas
14. **webhooks** - Eventos para integraciones
15. **configuraciones** - Parámetros dinámicos
16. **auditoria** - Bitácora de cambios
17. **documentacion** - Swagger automático
18. **tests** - Unitarios y e2e

## 🛠️ Tecnologías

- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM para TypeScript
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **Jest** - Testing
- **Class Validator** - Validaciones
- **Bcrypt** - Encriptación

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/anibau/SISTEMA-FR-backend.git
cd SISTEMA-FR-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos PostgreSQL**
```sql
CREATE DATABASE francachela_db;
CREATE USER francachela_user WITH PASSWORD 'francachela_password';
GRANT ALL PRIVILEGES ON DATABASE francachela_db TO francachela_user;
```

5. **Ejecutar migraciones**
```bash
npm run migration:run
```

6. **Iniciar en desarrollo**
```bash
npm run start:dev
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con watch
npm run start:debug        # Modo debug

# Producción
npm run build              # Compilar
npm run start:prod         # Iniciar en producción

# Base de datos
npm run migration:generate # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir migración

# Testing
npm run test               # Tests unitarios
npm run test:e2e          # Tests end-to-end
npm run test:cov          # Coverage

# Calidad de código
npm run lint              # ESLint
npm run format            # Prettier
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger estará disponible en:

```
http://localhost:3000/docs
```

## 🔐 Autenticación

### Roles Disponibles
- **administrador** - Acceso completo al sistema
- **vendedor** - Acceso a POS y funciones de venta

### Endpoints de Autenticación
```bash
POST /auth/login          # Iniciar sesión
POST /auth/register       # Registrar usuario
GET  /auth/profile        # Perfil del usuario
POST /auth/refresh        # Renovar token
```

## 🏪 Funcionalidades POS

### Multitickets
- Múltiples tickets activos por vendedor
- Persistencia automática
- Cambio rápido entre tickets

### Métodos de Pago
- Efectivo
- Yape
- Plin
- Transferencia bancaria

### Promociones Automáticas
- Por cantidad de productos
- Por monto de compra
- Por cumpleaños del cliente
- Activación/desactivación dinámica

## 🎯 Sistema de Puntos

- Configuración dinámica de puntos por sol
- Cálculo automático en ventas
- Consulta por número de cliente
- Ranking de clientes por puntos

## 🚚 Delivery

### Estados de Pedido
1. **Preparación** - Pedido recibido
2. **En camino** - Pedido despachado
3. **Entregado** - Pedido completado

### Integración WhatsApp
- Pedidos vía WhatsApp
- Confirmación automática
- Seguimiento de estado

## 📊 Reportes y Exportación

- Exportación de ventas a Excel
- Reportes de cierres de caja
- Historial de productos
- Ranking de clientes
- Bitácora de auditoría

## 🔧 Configuraciones Dinámicas

Parámetros editables desde la API:
- Puntos por sol gastado
- Radio de delivery
- Costo de delivery
- Descuento máximo en promociones
- Días de expiración de puntos

## 🔍 Auditoría

Sistema completo de trazabilidad:
- Cambios en precios y stock
- Acciones de usuarios
- Modificaciones de promociones
- Logs de acceso al sistema

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 🌐 CORS y Frontend

Configurado para conectar con frontend React:
- Origins configurables vía .env
- Credentials habilitados
- Headers personalizados permitidos

## 📝 Variables de Entorno

Ver `.env.example` para todas las configuraciones disponibles:
- Base de datos PostgreSQL
- JWT y seguridad
- CORS y frontend
- Funcionalidades del negocio
- Integraciones externas

## 🚀 Despliegue

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

### Docker (próximamente)
```bash
docker-compose up -d
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado por el equipo de **Francachela** para modernizar la gestión de licorería.

---

**Francachela - Tu tienda de licores** 🍷✨

