# BonoFácil - Sistema de Gestión de Bonos Corporativos

Sistema web para la gestión y cálculo de bonos corporativos con método americano, desarrollado con Angular 18 siguiendo los principios de Domain-Driven Design (DDD) y Arquitectura Hexagonal.

## 🏗️ Arquitectura DDD

Este proyecto sigue los principios de Domain-Driven Design con la siguiente estructura:

```
src/app/
├── core/                     # Núcleo de la aplicación
│   ├── domain/              # Lógica de negocio central
│   │   ├── models/          # Modelos de dominio
│   │   └── ports/           # Interfaces (puertos)
│   ├── application/         # Casos de uso
│   │   └── services/        # Servicios de aplicación
│   └── infrastructure/      # Implementaciones técnicas
│       ├── adapters/        # Adaptadores externos
│       ├── guards/          # Guards de Angular
│       └── interceptors/    # Interceptores HTTP
│
├── shared/                  # Componentes compartidos
│   ├── components/
│   ├── services/
│   └── models/
│
├── iam/                     # Identity & Access Management
│   ├── domain/             # Dominio de autenticación
│   ├── application/        # Lógica de autenticación
│   ├── infrastructure/     # Adaptadores de auth
│   └── views/              # Componentes de UI
│
├── bonos/                   # Gestión de bonos
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── views/
│
├── emisor/                  # Módulo del emisor
│   └── views/              # Vistas específicas del emisor
│
└── inversor/               # Módulo del inversor
    └── views/              # Vistas específicas del inversor
```

### Principios de DDD Aplicados:

1. **Separación de Dominios**: Cada módulo (IAM, Bonos, Emisor, Inversor) representa un contexto acotado.
2. **Arquitectura Hexagonal**: Los puertos definen las interfaces, los adaptadores implementan la comunicación externa.
3. **Inyección de Dependencias**: Los servicios de aplicación dependen de abstracciones (puertos), no de implementaciones concretas.
4. **Value Objects**: Moneda, TasaInteres, PlazoGracia son objetos de valor inmutables.
5. **Entidades**: User y Bono son las entidades principales con identidad única.

## 🚀 Características

- **Autenticación JWT** con roles (Emisor/Inversor)
- **Gestión de Bonos** con método americano
- **Cálculos Financieros**:
  - Flujo de caja
  - Duración y convexidad
  - TCEA (Tasa de Coste Efectivo Anual)
  - TREA (Tasa de Rendimiento Efectivo Anual)
  - Precio máximo del mercado
- **Plazos de Gracia** parciales y totales
- **Dashboard diferenciado** por rol

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Angular CLI (v18)
- Backend API ejecutándose en `http://localhost:8090`

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd untitled
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar el entorno:
   - Verificar que el archivo `src/environments/environment.ts` apunte al backend correcto

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
ng serve
```
La aplicación estará disponible en `http://localhost:4200`

### Producción
```bash
ng build --prod
```

## 🔐 Flujo de Autenticación

1. El usuario accede a `/login`
2. Ingresa credenciales y selecciona rol al registrarse
3. El sistema redirige según el rol:
   - **Emisor**: `/emisor/dashboard`
   - **Inversor**: `/inversor/dashboard`
4. Los guards protegen las rutas según permisos

## 📊 Módulos Principales

### IAM (Identity & Access Management)
- Login/Registro
- Gestión de sesiones
- Guards y interceptores JWT

### Emisor
- Dashboard con estadísticas
- Crear/Editar/Eliminar bonos
- Ver flujos de caja
- Calcular TCEA

### Inversor
- Catálogo de bonos disponibles
- Filtros por moneda y tasa
- Cálculos de inversión
- Guardar análisis

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## 📝 Notas Importantes

- El sistema usa **método americano** exclusivamente
- Los cálculos financieros siguen las fórmulas estándar de finanzas corporativas
- La autenticación JWT expira según configuración del backend
- Los datos se sincronizan en tiempo real con el backend

## 🤝 Contribución

Este proyecto sigue las convenciones de Angular y los principios SOLID. Al contribuir:

1. Mantener la separación de dominios
2. Seguir la arquitectura hexagonal
3. Crear tests para nuevas funcionalidades
4. Documentar cambios significativos

## 📄 Licencia

[Especificar licencia]
