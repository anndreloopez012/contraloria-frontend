
# Sistema de Navegación CGC

Este proyecto implementa un sistema de navegación moderno y responsivo para la Contraloría General de Cuentas (CGC) de Guatemala.

## 🚀 Características Principales

### ✨ Navegación Adaptativa
- **Header Flotante**: Diseño moderno con esquinas redondeadas y efecto glassmorphism
- **Mega Menú Bento**: Sistema de navegación multinivel con diseño tipo bento
- **Menú Móvil**: Navegación optimizada para dispositivos móviles con múltiples niveles
- **Transiciones Suaves**: Animaciones fluidas entre estados y niveles

### 📱 Diseño Responsivo
- Navegación completa en escritorio con mega menú
- Menú lateral deslizable en dispositivos móviles
- Adaptación automática según el tamaño de pantalla
- Iconos y texto ajustables según el espacio disponible

### 🎨 Sistema de Diseño
- **Colores Temáticos**: Cada sección tiene su color distintivo
- **Iconos Consistentes**: Biblioteca de iconos Lucide React
- **Efectos Visuales**: Backdrop blur, sombras suaves y gradientes
- **Microinteracciones**: Hover effects y transiciones de estado

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Header.tsx              # Navegación principal
│   ├── BentoMegaMenu.tsx      # Mega menú de escritorio
│   ├── MobileMenu.tsx         # Menú móvil multinivel
│   └── HeroSection.tsx        # Sección principal
├── hooks/
│   └── useContentAPI.ts       # Hook para manejo de contenido
└── pages/
    └── Index.tsx              # Página principal
```

### 🔧 Componentes Principales

#### Header.tsx
**Propósito**: Navegación principal flotante con logo y menús

**Características**:
- Header flotante con glassmorphism
- Logo animado con gradientes
- Navegación responsive (escritorio/móvil)
- Integración con API de contenido

**Estados**:
- `isMenuOpen`: Controla apertura del menú móvil
- `activeMegaMenu`: Gestiona el mega menú activo

#### BentoMegaMenu.tsx
**Propósito**: Mega menú de escritorio con diseño bento y navegación multinivel

**Características**:
- Diseño tipo bento con tarjetas
- Navegación de 3 niveles
- Transiciones dinámicas del tamaño
- Vista previa de videos integrada

**Estados**:
- `activeLevel`: Nivel actual de navegación
- `selectedSecondLevel`: Selección del segundo nivel
- `menuWidth`: Ancho dinámico del menú
- `isTransitioning`: Control de animaciones

#### MobileMenu.tsx
**Propósito**: Menú lateral para dispositivos móviles

**Características**:
- Panel deslizable desde la derecha
- Navegación de breadcrumb
- Soporte para 3 niveles de navegación
- Overlay con backdrop blur

**Estados**:
- `currentLevel`: Nivel actual en móvil
- `navigationStack`: Stack de navegación
- `selectedSecondLevel`: Nivel terciario seleccionado

#### useContentAPI.ts
**Propósito**: Hook personalizado para simulación de API

**Características**:
- Simulación de llamadas HTTP
- Manejo de estados de carga
- Tipado TypeScript completo
- Estructura de datos escalable

**Datos Gestionados**:
- `mainNavItems`: Elementos del menú principal
- `menuStructure`: Estructura anidada del menú
- `heroContent`: Contenido de la página principal

## 🎯 Funcionalidad del Menú

### 📊 Niveles de Navegación

#### Nivel 1 - Principal
```typescript
// Elementos principales del menú
[
  'Inicio',
  'Nosotros', 
  'Legislación',
  'Servicios',
  'Publicaciones',
  'Enlaces',
  'Contáctenos'
]
```

#### Nivel 2 - Categorías
Cada elemento principal contiene subcategorías específicas:

```typescript
// Ejemplo: Nosotros
nosotros: [
  'Historia',
  'Autoridades',  // ← Tiene submenú
  'Filosofía',
  'Código de Ética'
]
```

#### Nivel 3 - Elementos Específicos
```typescript
// Ejemplo: Autoridades
autoridades: {
  children: [
    'Autoridades Superiores',
    'Organigrama de la CGC',
    'Atribución de la CGC'
  ]
}
```

### 🔄 Flujo de Navegación

#### Escritorio (Mega Menú)
1. **Hover en nivel 1** → Muestra mega menú
2. **Click en elemento nivel 2** → Expande menú y muestra nivel 3
3. **Transición suave** → Ancho dinámico del contenedor
4. **Click "Volver"** → Contrae menú al estado anterior

#### Móvil (Menú Lateral)
1. **Click en hamburger** → Abre menú lateral
2. **Navegación por niveles** → Stack de breadcrumb
3. **Botón "Volver"** → Regresa al nivel anterior
4. **Overlay click** → Cierra menú completamente

### 🎨 Sistema de Colores

Cada sección tiene un color distintivo:

```typescript
const colorSystem = {
  inicio: 'blue',      // Azul
  nosotros: 'green',   // Verde  
  legislacion: 'purple', // Morado
  servicios: 'orange',  // Naranja
  publicaciones: 'indigo', // Índigo
  enlaces: 'teal',     // Verde azulado
  contactenos: 'red'   // Rojo
};
```

## 🔌 Integración con API

### 📡 Hook useContentAPI

El sistema está preparado para integración con APIs reales:

```typescript
// Uso actual (simulación)
const { mainNavItems, menuStructure, heroContent, isLoading } = useContentAPI();

// Preparado para integración real
const useContentAPI = () => {
  const fetchContent = async () => {
    const response = await fetch('/api/content');
    return response.json();
  };
  // ...resto de la lógica
};
```

### 🔄 Estructura de Datos

```typescript
interface MenuItem {
  icon: string;           // Nombre del icono
  title: string;          // Título visible
  key: string;           // Identificador único
  description?: string;   // Descripción opcional
  color?: string;        // Color del tema
  iconColor?: string;    // Color del icono
  videoTitle?: string;   // Título del video
  children?: MenuItem[]; // Elementos hijos
}
```

## 🚀 Instalación y Uso

### 📋 Prerrequisitos
```bash
Node.js >= 18
npm o yarn
```

### ⚡ Inicio Rápido
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

### 🔧 Configuración

#### Personalizar Contenido
Edita `src/hooks/useContentAPI.ts` para modificar:
- Elementos del menú
- Colores y iconos
- Contenido del hero
- Estructura de navegación

#### Integrar API Real
1. Reemplaza `mockApiData` con llamadas reales
2. Actualiza las interfaces TypeScript
3. Maneja estados de error y carga
4. Implementa cache si es necesario

## 🎨 Personalización

### 🎭 Temas y Colores
```typescript
// Cambiar esquema de colores
const customColors = {
  primary: 'blue',
  secondary: 'purple',
  accent: 'teal'
};
```

### 🔤 Tipografía
```css
/* Tailwind config personalizado */
fontFamily: {
  'sans': ['Inter', 'system-ui', 'sans-serif'],
  'heading': ['Poppins', 'system-ui', 'sans-serif']
}
```

### 📐 Espaciado y Tamaños
```typescript
// Configuración de tamaños
const menuConfig = {
  mobileWidth: '80vw',
  maxWidth: '1400px',
  headerHeight: '64px',
  menuOffset: '28px'
};
```

## 🐛 Solución de Problemas

### ❌ Problemas Comunes

#### Menú no se cierra en móvil
```typescript
// Verificar que el overlay tenga el evento onClick
<div onClick={closeMenu} className="overlay" />
```

#### Transiciones cortadas
```css
/* Asegurar contenedor con overflow */
.menu-container {
  overflow: hidden;
  transition: all 0.3s ease;
}
```

#### Iconos no aparecen
```typescript
// Verificar mapeo de iconos
const iconMap = {
  'Home': Home,
  'Users': Users,
  // ... resto de iconos
};
```

## 🔮 Futuras Mejoras

### 🎯 Roadmap
- [ ] Lazy loading de contenido
- [ ] Búsqueda en tiempo real
- [ ] Favoritos de usuario
- [ ] Modo oscuro
- [ ] PWA support
- [ ] Analíticas de navegación

### 🚀 Optimizaciones
- [ ] Code splitting por rutas
- [ ] Preload de contenido crítico
- [ ] Service Worker para cache
- [ ] Optimización de imágenes

---

## 📝 Documentación Técnica

### 🔍 Tipos TypeScript

```typescript
// Tipos principales del sistema
interface NavItem {
  icon: keyof typeof iconMap;
  title: string;
  key: string;
  color: string;
  iconColor: string;
}

interface MenuState {
  level: 'main' | string;
  breadcrumb: string[];
  selectedItem: string | null;
  isTransitioning: boolean;
}
```

### ⚡ Hooks Personalizados

```typescript
// Hook para manejo de navegación móvil
const useMobileNavigation = () => {
  const [level, setLevel] = useState('main');
  const [stack, setStack] = useState<string[]>([]);
  
  const navigate = (key: string, title: string) => {
    setStack([...stack, title]);
    setLevel(key);
  };
  
  const goBack = () => {
    setStack(stack.slice(0, -1));
    setLevel(stack.length > 1 ? 'previous-level' : 'main');
  };
  
  return { level, stack, navigate, goBack };
};
```

---

**Desarrollado con ❤️ para la Contraloría General de Cuentas de Guatemala**

Para más información o soporte técnico, consulta la documentación en línea o contacta al equipo de desarrollo.
