# 🍷 Francachela - Sistema de Gestión de Licorería (Frontend)

Frontend completo para el sistema de gestión de ventas e inventario para la licorería "Francachela", con enfoque en una experiencia de usuario moderna, funcional y robusta.

## 🚀 Características Principales

### 💻 Sistema de Punto de Venta (POS)
- **Interfaz táctil** optimizada para tablets y pantallas táctiles
- **Multiticket** para manejar múltiples ventas simultáneas
- **Búsqueda de productos** con soporte para códigos de barras
- **Múltiples métodos de pago**: Efectivo, Yape, Plin, Transferencia
- **Sistema de clientes** con puntos y fidelización
- **Aplicación automática de promociones**

### 🏪 Gestión Administrativa
- **Dashboard completo** con métricas y estadísticas en tiempo real
- **Gestión de productos** con CRUD completo, stock y categorías
- **Sistema de promociones** con reglas automáticas
- **Reportes y analíticas** avanzadas
- **Gestión de inventario** con alertas de stock
- **Control de usuarios** y permisos

### 🌐 Funcionalidades Avanzadas
- **Modo offline** con sincronización automática
- **Responsive design** adaptado a todos los dispositivos
- **Sistema de autenticación** JWT con roles
- **Notificaciones en tiempo real**
- **Exportación de datos** a Excel/PDF
- **Tests unitarios** y de integración

## 🛠️ Stack Tecnológico

### Frontend Core
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de estilos utilitarios

### UI/UX
- **shadcn/ui** - Componentes de interfaz de usuario
- **Radix UI** - Primitivos de UI accesibles
- **Lucide React** - Iconos modernos
- **Chart.js** - Visualización de datos

### Estado y Datos
- **Zustand** - Gestión de estado global
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Herramientas de Desarrollo
- **Vitest** - Framework de testing
- **Testing Library** - Utilidades de testing
- **ESLint** - Linter de código
- **Prettier** - Formateador de código

## 📂 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base de UI
│   └── layout/          # Layouts de la aplicación
├── features/            # Módulos por funcionalidad
│   ├── auth/            # Autenticación y autorización
│   ├── dashboard/       # Dashboard administrativo
│   ├── pos/             # Sistema de punto de venta
│   ├── products/        # Gestión de productos
│   ├── promotions/      # Sistema de promociones
│   ├── reports/         # Reportes y analíticas
│   └── customers/       # Gestión de clientes
├── lib/                 # Utilidades y configuraciones
│   ├── axios.ts         # Cliente HTTP configurado
│   ├── utils.ts         # Funciones utilitarias
│   └── offline.ts       # Sistema offline
├── routes/              # Configuración de rutas
└── __tests__/           # Tests unitarios
```

### Arquitectura por Características

Cada módulo en `features/` sigue la estructura:
```
feature/
├── api/                 # Llamadas a la API
├── components/          # Componentes específicos
├── stores/              # Estado del módulo
├── routes/              # Rutas del módulo
└── types/               # Tipos TypeScript
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Backend del sistema ejecutándose

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/anibau/SISTEMA-FR-frontend.git
   cd SISTEMA-FR-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con la URL del backend:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🧪 Testing

### Ejecutar tests
```bash
# Tests unitarios
npm run test

# Tests con interfaz
npm run test:ui

# Tests con cobertura
npm run test:coverage
```

### Estructura de Tests
- **Unitarios**: Funciones utilitarias y stores
- **Integración**: Componentes y flujos completos
- **E2E**: Flujos críticos del usuario (próximamente)

## 📱 Responsive Design

La aplicación está optimizada para:

- **📱 Móviles** (320px+): Navegación simplificada
- **📱 Tablets** (768px+): Interfaz POS táctil
- **💻 Escritorio** (1024px+): Dashboard completo
- **🖥️ Pantallas grandes** (1440px+): Múltiples paneles

## 🔐 Autenticación y Seguridad

### Sistema de Roles
- **Administrador**: Acceso completo al sistema
- **Vendedor**: Acceso al POS y funciones básicas
- **Supervisor**: Permisos intermedios

### Características de Seguridad
- Tokens JWT con expiración
- Rutas protegidas por rol
- Validación de entrada en formularios
- Sanitización de datos
- Manejo seguro de errores

## 🌐 Modo Offline

### Funcionalidades Offline
- **Caché inteligente** de productos y clientes
- **Cola de sincronización** para operaciones pendientes
- **Indicador visual** del estado de conexión
- **Sincronización automática** al restaurar conexión
- **Manejo de conflictos** en sincronización

### Datos Disponibles Offline
- Catálogo de productos
- Lista de clientes
- Promociones activas
- Configuraciones básicas

## 📊 Reportes y Analíticas

### Tipos de Reportes
- **Ventas**: Ingresos, tendencias, métodos de pago
- **Productos**: Top ventas, stock, rotación
- **Clientes**: Fidelización, comportamiento
- **Financiero**: Utilidades, gastos, flujo de caja
- **Inventario**: Movimientos, alertas, valorización

### Formatos de Exportación
- Excel (.xlsx)
- PDF
- CSV
- JSON (API)

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Francachela
VITE_APP_VERSION=1.0.0

# Features Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=true
```

### Personalización de Tema
Modificar `tailwind.config.js` para personalizar colores:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      // Más colores...
    }
  }
}
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Despliegue en Vercel
```bash
npm install -g vercel
vercel --prod
```

### Despliegue en Netlify
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔄 Integración con Backend

### Endpoints Principales
- `POST /auth/login` - Autenticación
- `GET /productos` - Lista de productos
- `POST /ventas` - Crear venta
- `GET /reportes/dashboard` - Métricas del dashboard
- `POST /promociones/aplicar` - Aplicar promoción

### Manejo de Errores
- Interceptores de Axios para errores globales
- Retry automático para fallos de red
- Fallback a datos offline cuando sea posible
- Notificaciones de usuario amigables

## 🤝 Contribución

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- Usar TypeScript para tipado estático
- Seguir convenciones de ESLint
- Escribir tests para nuevas funcionalidades
- Documentar componentes complejos
- Usar commits semánticos

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] App móvil con React Native
- [ ] Notificaciones push
- [ ] Integración con WhatsApp Business
- [ ] Sistema de delivery
- [ ] Análisis predictivo con IA
- [ ] Integración con sistemas contables

### Mejoras Técnicas
- [ ] Service Workers para mejor offline
- [ ] Optimización de bundle size
- [ ] Lazy loading de módulos
- [ ] Implementación de PWA
- [ ] Tests E2E con Playwright

## 📞 Soporte

### Documentación
- [Guía de Usuario](./docs/user-guide.md)
- [API Reference](./docs/api-reference.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Contacto
- **Email**: soporte@francachela.com
- **GitHub Issues**: Para reportar bugs
- **Discussions**: Para preguntas y sugerencias

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para Francachela**

*Sistema moderno de gestión para licorería con tecnología de vanguardia*

