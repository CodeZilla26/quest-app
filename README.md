# Quest Manager (JSX) + Tailwind

Aplicación de gestión de Quests con Objetivos (subtareas) creada con Next.js 14 (App Router), React 18 y Tailwind CSS. Sin archivos TypeScript; todo en JSX.

## Scripts
- dev: Inicia en http://localhost:3001
- build: Compila
- start: Sirve producción en el puerto 3001

## Instalación
```bash
npm install
npm run dev
```

## Arquitectura propuesta
- `app/`: App Router de Next. `layout.jsx`, `page.jsx`, estilos globales.
- `components/`: Componentes UI reutilizables (`Button`, `QuestInput`, `QuestList`, `QuestItem`, `ObjectiveList`, `ObjectiveItem`, `QuestFilterBar`).
- `context/`: `QuestContext.jsx` con reducer y persistencia en localStorage.
- `hooks/`: `useQuests.js` para exponer acciones/estado derivado y progreso.
- `shared/`: constantes y utilidades compartidas (`constants.js`).

## Patrones de diseño
- **[State Management con Reducer + Context]**: `useReducer` centraliza lógica de negocio; Context comparte estado.
- **[Custom Hook]**: `useQuests()` orquesta estado derivado (progreso), acciones y filtros.
- **[Separation of Concerns]**: UI desacoplada de la lógica (componentes vs contexto/hook).
- **[Compound + Provider Pattern]**: `TodoProvider` como raíz para componer la app.
- **[Persistencia]**: Sincronización con `localStorage` para mantener el estado entre recargas.

## Dominio de datos
- **Quest**: `{ id, title, completed, objectives: Objective[] }`
- **Objective**: `{ id, title, completed }`
- Una Quest se considera completada si todos sus objetivos están completados (si no tiene objetivos, usa `completed`).

## Tema Solo Leveling
- Gradientes índigo→púrpura, glows cian/morado, fondo atmosférico, tarjetas translúcidas.
- Utilidades en `app/globals.css`: `.card`, `.heading-epic`, `.shimmer-bar`.

## Extensiones futuras
- Tests con Vitest/RTL.
- i18n.
- Theming y animaciones avanzadas.
- API Routes para sincronizar con backend si se requiere.

Plan propuesto para el Booster de EXP
[Efecto]
Multiplicador a definir: 1.25x o 1.5x (recomendado 1.25x para balance).
Afecta:
EXP ganada al escribir notas (incrementos que van a expPending).
EXP otorgada al completar la quest (incluye el +50).
[Activación]
Al comprar el ítem booster_exp_30 en 
ShopModal
, activamos de inmediato un estado global:
state.boosters.exp = { multiplier, activeUntil }
Si ya hay uno activo, deshabilitar compra o preguntar si quiere reemplazar (recomiendo deshabilitar hasta que expire).
[Duración]
30 minutos desde la compra. activeUntil = Date.now() + 30*60*1000.
[UI]
En 
Header.jsx
, debajo de la barra de EXP, una etiqueta pequeña:
“Booster EXP activo: 23m”
En 
ShopModal
, desactivar/avisar si ya hay un booster activo y mostrar tiempo restante.
[Lógica]
context/QuestContext.jsx
:
Añadir boosters: { exp?: { multiplier: number, activeUntil: string } }.
En SET_OBJECTIVE_NOTE, aplicar multiplicador al gained y al award si booster activo y no expirado.
Efecto que limpia booster al expirar o chequeo en tiempo real antes de aplicar.
hooks/useQuests.js
: sin cambios grandes (expuesto ya 
purchaseItem
), pero podemos añadir getBoosterStatus() si quieres.
Confirmaciones rápidas
Multiplicador: ¿1.25x o 1.5x?
¿Deshabilitamos compra mientras haya booster activo? (recomendado: Sí)
¿Mostramos etiqueta en Header con tiempo restante? (recomendado: Sí)
Dime esos tres puntos y lo implemento ahora mismo en:

context/QuestContext.jsx
 (estado y aplicación del booster).
components/Header.jsx
 (indicador de booster activo).
components/ShopModal.jsx
 (deshabilitar compra y mostrar tiempo restante).