# Configuración del API Real - CGC (Strapi v5)

## APIs Configurados

### 1. API de Menús Principales (`apiServiceMenu.ts`)

**URL Base:** `https://cgc-adm.server-softplus.plus/api/menus`
**Endpoint completo:** `https://cgc-adm.server-softplus.plus/api/menus?filters[slug][$eq]=menu&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children`

**Autenticación:** Bearer Token
**Token:** `f97ea243eee905c632ce607fe60ae41b256d8a12d27ccdb00a581e981480587393d1a63312c9733a9a1f097f3c9f707de6ab00d1b81dd363f0aa42bffcb9d2c539fafd2edb4a47b1b97dfcbcdf926c3e26265b38c47d7449681e54ca06f698bad03f0d7f90ee2702862ebfe9f662d1e2ae3d4eaebc4fee0ead47bac9e87b1e8f`

### 2. API de Enlaces Externos (`apiServiceLinkBlank.ts`)

**URL Base:** `https://cgc-adm.server-softplus.plus/api/menus`
**Endpoint completo:** `https://cgc-adm.server-softplus.plus/api/menus?filters[slug][$eq]=menu-link-blank&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children`

**Autenticación:** Bearer Token
**Token:** `f97ea243eee905c632ce607fe60ae41b256d8a12d27ccdb00a581e981480587393d1a63312c9733a9a1f097f3c9f707de6ab00d1b81dd363f0aa42bffcb9d2c539fafd2edb4a47b1b97dfcbcdf926c3e26265b38c47d7449681e54ca06f698bad03f0d7f90ee2702862ebfe9f662d1e2ae3d4eaebc4fee0ead47bac9e87b1e8f`

**Uso:**
- Enlaces externos que aparecen en la navegación principal
- Respeta el campo `target_blank` para abrir en nueva ventana
- El `title` se usa como tooltip
- Se muestra en desktop al lado del menú principal, en tablet/móvil abajo del menú

## Configuración Implementada

### Variables de Configuración
Dado que Lovable no soporta archivos .env, las variables se configuran directamente en el código:

```typescript
// Configuración del API
const API_CONFIG = {
  BASE_URL: 'https://cgc-adm.server-softplus.plus/api/menus',
  BEARER_TOKEN: '66014f4e51baa387e6127309fee602a30299b662d4fbb53104a8a50bb3f7127fee6fd3f1d3513ff587c2b84e0d1fe2bb314b9ed8a22704bd7852e0c9773e02440533b078e2fa180da163e341f5b0101b8810196d253a071e4472c2b5831826685ac9fe5f43f51d3421d571e545884c1b85237254b8bd5c394da845abbf7847f7',
  ENDPOINT_PARAMS: 'filters[slug][$eq]=menu&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children'
};
```

### Servicio API de Menús (src/services/apiServiceMenu.ts)
Se creó un servicio dedicado para manejar las llamadas al API de menús (Strapi v5):

- **fetchMenuData()**: Obtiene la estructura completa del menú desde Strapi v5
- **transformStrapiResponse()**: Adapta la respuesta de Strapi v5 a la estructura esperada por los componentes
- **Manejo de errores**: Sin fallback, solo caché local
- **Caché local**: Almacena respuestas para mejorar performance

### Servicio API de Enlaces Externos (src/services/apiServiceLinkBlank.ts)
Se creó un servicio dedicado para manejar enlaces externos (Strapi v5):

- **fetchExternalLinks()**: Obtiene enlaces externos desde Strapi v5
- **transformStrapiLinkResponse()**: Adapta la respuesta a estructura ExternalLink
- **Manejo de target_blank**: Respeta el comportamiento de apertura de enlaces
- **Caché local**: Almacena respuestas con expiración de 1 hora

### Estructura de Datos de Strapi v5

El API de Strapi v5 devuelve una estructura como:

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "dgsya9sdnsg624a6w845a0br",
      "title": "menu",
      "slug": "menu",
      "items": [
        {
          "id": 1,
          "documentId": "k3seli7agffpqu4ybd5a5sl3",
          "title": "INICIO",
          "children": [...]
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### Transformación de Datos

La función `transformStrapiResponse()` convierte la estructura de Strapi v5 a:

```typescript
{
  mainNavItems: MenuItem[],
  menuStructure: Record<string, MenuItem[]>
}
```

Donde `MenuItem` mantiene la estructura original esperada por los componentes.

## Componentes Afectados

- **Header.tsx**: Integra ExternalLinks en la navegación desktop
- **MobileMenu.tsx**: Muestra enlaces externos en tablet/móvil
- **ExternalLinks.tsx**: Componente dedicado para mostrar enlaces externos
- **SimpleMegaMenu.tsx**: Funciona con la estructura transformada de menús

## Estado Actual

✅ **API Real de Menús Implementado** - El sistema consume el API real de CGC para menús principales
✅ **API Real de Enlaces Externos Implementado** - Sistema de enlaces externos con target_blank
❌ **API Mock Removido** - Se eliminaron completamente los datos simulados para menús

### Comportamiento del Sistema

1. **Carga Exitosa**: Si los APIs responden correctamente, se muestran menús y enlaces reales
2. **Error de API**: Si algún API falla, se usan datos en caché o arrays vacíos
3. **Contenido Estático**: Hero, redes sociales, carrusel y publicidad usan datos por defecto

### Funciones Disponibles en useContentAPI

- `mainNavItems`: Estructura de menús principales
- `menuStructure`: Estructura anidada de submenús
- `externalLinks`: Enlaces externos con target_blank
- `refreshData()`: Refresca los datos desde ambos APIs
- `clearCache()`: Limpia el caché local del navegador (ambos APIs)

## Notas Importantes

- ⚠️ **Seguridad**: Los tokens Bearer están hardcodeados. En producción deberían manejarse de forma más segura
- 🔄 **Caché**: Las respuestas se cachean localmente para mejorar performance (1 hora de expiración)
- 🔧 **Mantenimiento**: Si cambia la estructura de algún API, solo hay que actualizar las funciones de transformación correspondientes
- 📁 **Organización**: Cada API tiene su propio archivo de servicio para mejor organización
- 🎯 **Enlaces Externos**: Se muestran diferente según el dispositivo (desktop: tooltips, tablet/móvil: botones con texto)

## Testing APIs

```bash
# API de Menús Principales
curl -H "Authorization: Bearer f97ea243eee905c632ce607fe60ae41b256d8a12d27ccdb00a581e981480587393d1a63312c9733a9a1f097f3c9f707de6ab00d1b81dd363f0aa42bffcb9d2c539fafd2edb4a47b1b97dfcbcdf926c3e26265b38c47d7449681e54ca06f698bad03f0d7f90ee2702862ebfe9f662d1e2ae3d4eaebc4fee0ead47bac9e87b1e8f" \
"https://cgc-adm.server-softplus.plus/api/menus?filters[slug][\$eq]=menu&populate[items][filters][parent][id][\$null]=true&populate[items][populate][children][populate][children][populate]=children"

# API de Enlaces Externos
curl -H "Authorization: Bearer f97ea243eee905c632ce607fe60ae41b256d8a12d27ccdb00a581e981480587393d1a63312c9733a9a1f097f3c9f707de6ab00d1b81dd363f0aa42bffcb9d2c539fafd2edb4a47b1b97dfcbcdf926c3e26265b38c47d7449681e54ca06f698bad03f0d7f90ee2702862ebfe9f662d1e2ae3d4eaebc4fee0ead47bac9e87b1e8f" \
"https://cgc-adm.server-softplus.plus/api/menus?filters[slug][\$eq]=menu-link-blank&populate[items][filters][parent][id][\$null]=true&populate[items][populate][children][populate][children][populate]=children"
```