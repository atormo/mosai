# 🟧 MOSAI — Plan de desarrollo MVP

> **"Tu link in bio, pero bonito."**
> Un mosaico visual de enlaces donde cada pieza es una imagen clicable. Simple, bonito, para todos.

---

## 1. ¿Qué es MOSAI?

MOSAI es un servicio de link-in-bio **visual-first**. En lugar de la típica lista de botones aburridos de Linktree, tu página es un **mosaico de imágenes** — cada una es un link clicable. Piensa en un grid estilo Instagram pero donde cada imagen lleva a un destino diferente.

**Diferenciación frente a la competencia:**

| Competidor | Enfoque | Debilidad que MOSAI ataca |
|---|---|---|
| **Linktree** | Lista de botones de texto | Feo, genérico, cero personalidad visual |
| **Sprout.link** | Grid visual para empresas | Solo para grandes marcas, no democrático |
| **Shorby** | Links + mensajería | Demasiado complejo, pierde foco visual |
| **Pallyy** | Grid que replica tu feed IG | Atado a Instagram, no independiente |
| **Tap.bio** | Cards deslizables | UX confusa, no intuitivo |
| **Lnk.Bio** | Grid básico | Diseño anticuado, poca personalización |

**MOSAI es diferente porque:**
- Es **100% visual** — imágenes como protagonistas, no botones de texto
- Es **democrático** — pensado para cualquier creador, no solo enterprises
- Tiene **badges informativos** — sellos como "🔥 Finaliza pronto" o "✨ Nuevo"
- Es **bonito de verdad** — diseño con personalidad, temas visuales cuidados
- Es **extremadamente simple** — crear un mosai en menos de 2 minutos

**URL pública:** `mosai.link/username` (o dominio que se consiga: getmosai.com, mosai.app...)

---

## 2. Alcance del MVP

### ✅ Incluido en MVP
- Auth: Registro / Login (email + password)
- Onboarding: Elegir username único al registrarse
- Dashboard: Panel privado para gestionar tus piezas (los links visuales)
- Crear pieza: Upload imagen + URL destino + título opcional + badge opcional
- Editar pieza: Modificar cualquier campo
- Eliminar pieza: Con confirmación
- Reordenar piezas: Drag & drop
- Preview en vivo: Simulación móvil de tu página mientras editas
- Temas visuales: 5 temas predefinidos para la página pública
- Página pública: Grid de imágenes clicable en `/:username`
- Perfil: Avatar, nombre, bio corta
- Badges: Sellos informativos sobre las imágenes
- Responsive: Mobile-first (el tráfico viene de Instagram)
- Copy link: Botón para copiar tu mosai.link/username

### ❌ NO incluido en MVP (futuro)
- Analytics de clics
- Landing page de marketing / pricing
- Planes de pago
- Dominio custom
- Login social (Google/Apple)
- Scheduling de piezas
- Integraciones con plataformas externas

---

## 3. Nomenclatura del producto

| Término | Significado |
|---|---|
| **MOSAI** | El servicio/producto |
| **Mosai** (tu mosai) | La página pública de un usuario |
| **Pieza** | Cada link visual individual (imagen + URL + badge) |
| **Badge** | Sello informativo superpuesto en una pieza |
| **Tema** | Estilo visual aplicado a la página pública |

---

## 4. Stack técnico

| Capa | Tecnología | Motivo |
|------|-----------|--------|
| **Framework** | Next.js 14 (App Router) | SSR para páginas públicas (SEO + velocidad), dashboard como SPA |
| **Lenguaje** | TypeScript | Type safety |
| **Estilos** | Tailwind CSS | Flexible, rápido, personalizable |
| **Componentes UI** | shadcn/ui | Bonitos, accesibles, personalizables |
| **Auth** | Supabase Auth | Gratis, integrado con DB |
| **Base de datos** | Supabase (PostgreSQL) | Gratis hasta 500MB, relacional, RLS |
| **Storage** | Supabase Storage | Para uploads de imágenes |
| **Drag & drop** | @dnd-kit/core | Ligero, accesible, buen DX en React |
| **Optimización img** | next/image + Supabase Transforms | Resize automático, lazy loading, WebP |
| **Deploy** | Vercel | Deploy automático, edge functions, rápido |
| **Fuentes** | Google Fonts (variable) | Cargadas con next/font para rendimiento |

---

## 5. Modelo de datos

### Tabla: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 160),
  avatar_url TEXT DEFAULT '',
  theme TEXT DEFAULT 'clean',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles visibles por todos"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Usuario edita su perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuario inserta su perfil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### Tabla: `pieces` (piezas del mosaico)
```sql
CREATE TABLE pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  title TEXT DEFAULT '' CHECK (char_length(title) <= 60),
  badge_text TEXT DEFAULT '' CHECK (char_length(badge_text) <= 24),
  badge_type TEXT DEFAULT 'none'
    CHECK (badge_type IN ('none','urgency','new','promo','limited','course','custom')),
  badge_emoji TEXT DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pieces_user_position ON pieces(user_id, position);

ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Piezas activas visibles por todos, owner ve todas"
  ON pieces FOR SELECT USING (
    is_active = true OR user_id = auth.uid()
  );

CREATE POLICY "Usuario inserta sus piezas"
  ON pieces FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuario edita sus piezas"
  ON pieces FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuario elimina sus piezas"
  ON pieces FOR DELETE USING (auth.uid() = user_id);
```

### Storage Buckets (Supabase)
```
avatars/       → público, max 2MB, solo jpg/png/webp
piece-images/  → público, max 5MB, solo jpg/png/webp/gif
```

---

## 6. Estructura de archivos

```
mosai/
├── app/
│   ├── layout.tsx                       # Layout raíz + providers + fonts
│   ├── page.tsx                         # Redirect a /dashboard o /login
│   │
│   ├── (auth)/                          # Auth pages (layout centrado, sin nav)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── dashboard/                       # Panel privado (requiere auth)
│   │   ├── layout.tsx                   # Layout con sidebar/header
│   │   ├── page.tsx                     # Gestión de piezas (grid + drag&drop)
│   │   └── settings/page.tsx            # Perfil + tema + avatar
│   │
│   └── [username]/                      # Página pública (SSR)
│       └── page.tsx                     # Carga perfil + piezas, renderiza mosaico
│
├── components/
│   ├── ui/                              # shadcn/ui base components
│   │
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   │
│   ├── dashboard/
│   │   ├── piece-card.tsx               # Card de una pieza (editable, con acciones)
│   │   ├── piece-grid.tsx               # Grid con drag & drop (@dnd-kit)
│   │   ├── piece-form.tsx               # Modal/drawer: crear o editar pieza
│   │   ├── badge-picker.tsx             # Selector de badge (presets + custom)
│   │   ├── image-uploader.tsx           # Upload con preview y crop
│   │   ├── theme-picker.tsx             # Selector visual de temas
│   │   ├── live-preview.tsx             # Simulación móvil del mosai
│   │   ├── copy-link-button.tsx         # Copiar URL del mosai
│   │   └── header.tsx                   # Top bar del dashboard
│   │
│   └── public/
│       ├── mosai-grid.tsx               # Grid público con tema aplicado
│       ├── mosai-piece.tsx              # Pieza individual (imagen + badge + link)
│       ├── mosai-header.tsx             # Avatar + nombre + bio
│       └── mosai-footer.tsx             # "Hecho con MOSAI" (branding)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # createBrowserClient
│   │   ├── server.ts                    # createServerClient (SSR)
│   │   └── middleware.ts                # Auth middleware helper
│   ├── types.ts                         # Profile, Piece, Badge, Theme types
│   ├── utils.ts                         # cn(), formatters, validators
│   ├── themes.ts                        # Definición de temas
│   ├── badges.ts                        # Presets de badges
│   └── validations.ts                   # Zod schemas
│
├── hooks/
│   ├── use-pieces.ts                    # CRUD + reorder de piezas
│   ├── use-profile.ts                   # Perfil del usuario
│   └── use-upload.ts                    # Upload de imágenes
│
├── middleware.ts                         # Proteger /dashboard, redirect auth
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 7. Diseño visual — Tendencias 2026 aplicadas

Basado en las tendencias actuales de diseño SaaS y web 2026, el diseño de MOSAI incorpora:

### Principios generales
- **Strategic minimalism**: Cada elemento existe porque aporta. Sin decoración vacía.
- **Mobile-first radical**: La página pública se diseña para móvil primero y se adapta a desktop — no al revés. El 95%+ del tráfico viene de Stories/Bio de Instagram.
- **Personalidad visual**: Nada de genérico. Tipografía con carácter, paleta memorable, micro-animaciones que deleitan.
- **Velocidad percibida**: Skeletons, progressive image loading, transiciones suaves. La página debe sentirse instantánea.

### Tipografía
- **Display/títulos**: Fuente con personalidad (opciones: Instrument Serif, Fraunces, Clash Display, o Satoshi)
- **Body/UI**: Fuente limpia y moderna (opciones: General Sans, Plus Jakarta Sans, Geist)
- **Monospace** (detalles): Geist Mono o JetBrains Mono para usernames y URLs
- **NO usar**: Inter, Roboto, Arial, Open Sans — estas son las que usa todo el mundo

### Paleta de color (brand)
```
Primary:     #FF6B35 (naranja cálido — energía, creatividad)
Secondary:   #1A1A2E (azul muy oscuro — elegancia)
Accent:      #E8FF8B (lima — pop visual, CTAs)
Surface:     #FAFAF8 (off-white cálido — no blanco puro)
Muted:       #A3A3A3 (gris suave)

Dashboard BG:   #FAFAF8
Public dark BG: #0A0A0F
```

### Micro-animaciones
- Hover en piezas del grid: **scale(1.02)** sutil + sombra
- Badge aparece con **pop-in** al cargar
- Drag & drop: pieza se eleva con sombra y **opacity(0.9)**
- Preview en vivo: transiciones suaves al reordenar
- Copy link: feedback con animación de checkmark ✓
- Formularios: campos con **border-color transition** al focus

### Componentes clave del dashboard
- **Piece card**: Imagen cuadrada con overlay sutil al hover, botones de editar/eliminar que aparecen al hover, badge visible, toggle de activo/inactivo como switch
- **Piece form**: Modal centrado con preview instantáneo de la imagen, selector de badge visual (pills clickables), URL con validación en tiempo real
- **Live preview**: Frame de móvil (iPhone-like border) mostrando tu mosai tal como se verá, se actualiza en tiempo real
- **Theme picker**: Cards horizontales con preview miniatura de cada tema, click para aplicar

---

## 8. Temas visuales (5 temas v1)

Cada tema define: background, gap del grid, border-radius de las piezas, tipografía del header, estilo de badges, y efecto hover.

### Clean (default)
- Fondo: `#FAFAF8` (off-white cálido)
- Grid: gap-1, sin border-radius (edge to edge)
- Badges: pill negra con texto blanco
- Header: sans-serif, peso medium
- Hover: scale sutil + overlay semitransparente
- Vibe: **Profesional, limpio, atemporal**

### Midnight
- Fondo: `#0A0A0F` (casi negro con matiz azul)
- Grid: gap-2, border-radius-lg (12px)
- Badges: pill blanca con texto negro
- Header: sans-serif bold, texto blanco
- Hover: glow sutil en el borde + scale
- Vibe: **Elegante, nocturno, premium**

### Candy
- Fondo: gradiente pastel (`#FFE5EC` → `#E5F0FF`)
- Grid: gap-3, border-radius-xl (16px)
- Badges: pill colorida con fondo del tipo de badge
- Header: display serif, peso bold
- Hover: rotación muy sutil (1deg) + scale + sombra colorida
- Vibe: **Divertido, colorido, juguetón**

### Brutalist
- Fondo: `#F5F0EB` (crema)
- Grid: gap-0, sin radius, borde negro 2px entre piezas
- Badges: fondo amarillo #FFE500, texto negro, rotación -2deg
- Header: monospace uppercase, tracking wide
- Hover: inversión de colores o underline grueso
- Vibe: **Raw, artístico, atrevido**

### Film
- Fondo: `#1A1A1A` (gris muy oscuro)
- Grid: gap-4, piezas con aspect-ratio 3:4 (vertical, tipo polaroid)
- Badges: texto blanco con backdrop-blur sutil
- Header: serif italic, peso light
- Hover: brightness up + cursor pointer
- Vibe: **Fotográfico, editorial, cinematográfico**

```ts
// lib/themes.ts
export const themes = {
  clean: {
    name: 'Clean',
    preview: '○', // emoji/icon para el picker
    container: 'bg-[#FAFAF8]',
    grid: 'gap-1',
    piece: 'rounded-none',
    badge: 'bg-black text-white rounded-full',
    header: 'font-sans font-medium text-gray-900',
    text: 'text-gray-600',
    hover: 'hover:scale-[1.02] transition-transform',
    aspectRatio: 'aspect-square',
  },
  midnight: {
    name: 'Midnight',
    preview: '●',
    container: 'bg-[#0A0A0F]',
    grid: 'gap-2',
    piece: 'rounded-xl',
    badge: 'bg-white text-black rounded-full',
    header: 'font-sans font-bold text-white',
    text: 'text-gray-400',
    hover: 'hover:scale-[1.02] hover:ring-1 hover:ring-white/20 transition-all',
    aspectRatio: 'aspect-square',
  },
  candy: {
    name: 'Candy',
    preview: '◐',
    container: 'bg-gradient-to-br from-[#FFE5EC] to-[#E5F0FF]',
    grid: 'gap-3',
    piece: 'rounded-2xl',
    badge: 'rounded-full font-bold',
    header: 'font-serif font-bold text-gray-900',
    text: 'text-gray-600',
    hover: 'hover:scale-[1.03] hover:rotate-[0.5deg] hover:shadow-lg transition-all',
    aspectRatio: 'aspect-square',
  },
  brutalist: {
    name: 'Brutalist',
    preview: '■',
    container: 'bg-[#F5F0EB]',
    grid: 'gap-0 border-2 border-black',
    piece: 'rounded-none border border-black',
    badge: 'bg-[#FFE500] text-black font-mono uppercase -rotate-2',
    header: 'font-mono uppercase tracking-widest text-black',
    text: 'text-black/70',
    hover: 'hover:invert transition-all',
    aspectRatio: 'aspect-square',
  },
  film: {
    name: 'Film',
    preview: '◑',
    container: 'bg-[#1A1A1A]',
    grid: 'gap-4',
    piece: 'rounded-sm',
    badge: 'bg-white/10 backdrop-blur text-white rounded',
    header: 'font-serif italic font-light text-white',
    text: 'text-gray-500',
    hover: 'hover:brightness-110 transition-all',
    aspectRatio: 'aspect-[3/4]',
  },
} as const;

export type ThemeKey = keyof typeof themes;
```

---

## 9. Sistema de Badges

```ts
// lib/badges.ts
export const badgePresets = [
  {
    type: 'none',
    label: 'Sin badge',
    emoji: '',
    color: '',
    description: 'Sin indicador',
  },
  {
    type: 'urgency',
    label: 'Finaliza pronto',
    emoji: '🔥',
    color: 'bg-red-500',
    description: 'Para contenido que expira',
  },
  {
    type: 'new',
    label: 'Nuevo',
    emoji: '✨',
    color: 'bg-emerald-500',
    description: 'Para contenido reciente',
  },
  {
    type: 'promo',
    label: 'Sorteo',
    emoji: '🎁',
    color: 'bg-purple-500',
    description: 'Para sorteos y concursos',
  },
  {
    type: 'limited',
    label: 'Último día',
    emoji: '⏰',
    color: 'bg-orange-500',
    description: 'Para ofertas de tiempo limitado',
  },
  {
    type: 'course',
    label: 'Curso',
    emoji: '📚',
    color: 'bg-blue-500',
    description: 'Para contenido educativo',
  },
  {
    type: 'custom',
    label: 'Personalizado',
    emoji: '',
    color: 'bg-gray-700',
    description: 'Escribe tu propio texto y emoji',
  },
] as const;

export type BadgeType = typeof badgePresets[number]['type'];
```

**Comportamiento visual del badge:**
- Se posiciona en la esquina superior derecha de la pieza
- Es una **pill** (border-radius completo) con padding horizontal
- Muestra: emoji + texto corto (ej: "🔥 Finaliza pronto")
- En el tema Clean: fondo negro texto blanco
- En el tema Midnight: fondo blanco texto negro
- En el tema Candy: usa el color propio del badge
- En el tema Brutalist: fondo amarillo, rotado -2°, texto negro mono
- En el tema Film: fondo semi-transparente con backdrop-blur
- Animación al cargar: aparece con un pop-in sutil (scale 0→1)
- Max 24 caracteres para badge custom

---

## 10. Flujos de usuario detallados

### 10.1 Registro
```
/register
→ Form: email, password, username, display_name
→ Username: validación en tiempo real (disponibilidad + formato)
   - 3-30 chars, solo [a-z0-9-], no empezar/terminar en guión
   - Debounce 300ms para check en DB
   - ✅ verde: "mosai.link/tormius está disponible"
   - ❌ rojo: "Este username ya está en uso"
→ Supabase auth.signUp()
→ INSERT en profiles(id, username, display_name)
→ Redirect → /dashboard
```

### 10.2 Crear una pieza
```
Dashboard → click "+ Nueva pieza"
→ Abre modal/drawer con form:
   1. Upload imagen (drag & drop o click)
      → Preview instantáneo del archivo
      → Upload a Supabase Storage
      → Se muestra la imagen subida
   2. URL de destino (input con validación)
      → Debe empezar con http:// o https://
      → Feedback: ✅ "URL válida" / ❌ "Introduce una URL válida"
   3. Título (opcional, max 60 chars)
      → Se superpone en la parte inferior de la imagen
   4. Badge (opcional)
      → Click en preset (pills visuales) o elegir "Custom"
      → Si custom: input de texto (max 24) + selector de emoji
→ Click "Crear pieza"
→ INSERT en pieces + upload imagen
→ Pieza aparece al final del grid
→ Live preview se actualiza
```

### 10.3 Reordenar piezas
```
Dashboard → el grid de piezas soporta drag & drop
→ Agarrar una pieza → se eleva visualmente (sombra + slight scale)
→ Arrastrar a nueva posición → las demás se reorganizan con animación
→ Soltar → UPDATE batch de positions en Supabase
→ Live preview se actualiza en tiempo real
```

### 10.4 Página pública
```
Visitante → mosai.link/tormius
→ SSR: fetch profile + pieces WHERE username = 'tormius'
→ Si no existe → 404 con branding MOSAI
→ Si existe:
   → Renderizar header: avatar + display_name + bio
   → Aplicar tema visual del usuario
   → Renderizar grid de piezas (imágenes con badges)
   → Cada pieza: <a href={destination_url} target="_blank" rel="noopener">
   → Footer: "Hecho con MOSAI ✨" (link a la home)
   → Meta tags: Open Graph con avatar y nombre para previews bonitos
```

---

## 11. Wireframes conceptuales

### Dashboard (desktop)
```
┌───────────────────────────────────────────────────────────────┐
│  🟧 MOSAI          mosai.link/tormius [📋]    [⚙ Settings]    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Tus piezas (6)                            [+ Nueva pieza]    │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │             │ │  🔥 Finaliza│ │             │   PREVIEW    │
│  │   imagen    │ │   imagen    │ │   imagen    │   ┌───────┐  │
│  │             │ │             │ │             │   │ ┌───┐ │  │
│  │  "Podcast"  │ │  "Sorteo"   │ │  "Portfolio"│   │ │ 📱│ │  │
│  │  ✏️  👁  🗑 │ │  ✏️  👁  🗑 │ │  ✏️  👁  🗑 │   │ │   │ │  │
│  └─────────────┘ └─────────────┘ └─────────────┘   │ │   │ │  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │ │   │ │  │
│  │  ✨ Nuevo   │ │             │ │  📚 Curso   │   │ └───┘ │  │
│  │   imagen    │ │   imagen    │ │   imagen    │   └───────┘  │
│  │             │ │             │ │             │               │
│  │  "Blog"     │ │  "Shop"     │ │  "Aprende"  │               │
│  │  ✏️  👁  🗑 │ │  ✏️  👁  🗑 │ │  ✏️  👁  🗑 │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                               │
│  ☝️ Arrastra las piezas para reordenar tu mosaico              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Dashboard (mobile)
```
┌──────────────────────┐
│ 🟧 MOSAI    [⚙] [+]  │
├──────────────────────┤
│ mosai.link/tormius 📋 │
│                      │
│ ┌────────┐┌────────┐ │
│ │ imagen ││🔥imagen│ │
│ │        ││        │ │
│ │Podcast ││Sorteo  │ │
│ └────────┘└────────┘ │
│ ┌────────┐┌────────┐ │
│ │ imagen ││✨imagen│ │
│ │        ││        │ │
│ │Portfol.││Blog    │ │
│ └────────┘└────────┘ │
│                      │
│ [👁 Ver preview]      │
└──────────────────────┘
```

### Página pública (mosai.link/tormius) — en móvil
```
┌──────────────────────┐
│                      │
│      (avatar)        │
│      Tormius         │
│  Diseñador & Creador │
│                      │
│ Toca una imagen ↓    │
│                      │
│ ┌──────┐┌──────┐┌──────┐
│ │      ││ 🔥   ││      │
│ │ img  ││ img  ││ img  │
│ │      ││      ││      │
│ └──────┘└──────┘└──────┘
│ ┌──────┐┌──────┐┌──────┐
│ │ ✨   ││      ││ 📚   │
│ │ img  ││ img  ││ img  │
│ │      ││      ││      │
│ └──────┘└──────┘└──────┘
│ ┌──────┐
│ │      │
│ │ img  │
│ │      │
│ └──────┘
│                      │
│  Hecho con MOSAI ✨   │
│                      │
└──────────────────────┘
```

---

## 12. Validaciones

| Campo | Regla |
|---|---|
| **Username** | 3-30 chars, solo `[a-z0-9-]`, no empezar/terminar en `-`, único |
| **Display name** | 1-50 chars |
| **Bio** | Max 160 chars |
| **Avatar** | Max 2MB, solo jpg/png/webp |
| **Imagen pieza** | Max 5MB, solo jpg/png/webp/gif |
| **URL destino** | Debe empezar por `http://` o `https://`, URL válida |
| **Título pieza** | Max 60 chars |
| **Badge text** | Max 24 chars |
| **Piezas por usuario** | Max 50 en MVP |

---

## 13. Rendimiento y SEO

### Página pública (crítico)
- **SSR** con Next.js para SEO y velocidad inicial
- **next/image** con lazy loading y formatos automáticos (WebP/AVIF)
- **Tamaño de imagen servido**: max 400x400px para el grid (resize en Supabase o al subir)
- **Cache headers**: páginas públicas con `s-maxage=60, stale-while-revalidate`
- **Open Graph meta tags**: `og:title`, `og:description`, `og:image` (avatar del usuario)
- **Favicon**: generado dinámicamente o default de MOSAI

### Dashboard
- **Optimistic updates**: al reordenar, la UI se actualiza antes de confirmar DB
- **Skeleton loading**: placeholders animados mientras carga
- **Image preview**: mostrar thumbnail local antes de subir (URL.createObjectURL)

---

## 14. Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MOSAI
```

---

## 15. Orden de implementación

### Fase 1 — Fundación (setup del proyecto)
1. `npx create-next-app@latest mosai` con TypeScript + Tailwind + App Router
2. Instalar dependencias: `shadcn/ui`, `@dnd-kit/core`, `@dnd-kit/sortable`, `zod`
3. Configurar fuentes custom con `next/font/google`
4. Crear proyecto Supabase → obtener URL + keys
5. Ejecutar SQL para crear tablas `profiles` y `pieces` con RLS
6. Crear storage buckets: `avatars` y `piece-images`
7. Configurar Supabase client (browser + server)
8. Configurar middleware de auth (`middleware.ts`)

### Fase 2 — Auth
9. Layout de auth (centrado, fondo con branding MOSAI)
10. Página de registro con validación de username en tiempo real
11. Página de login
12. Redirect automático: autenticado → /dashboard, no autenticado → /login

### Fase 3 — Dashboard core
13. Layout del dashboard (header con logo + username + link + settings)
14. Listar piezas del usuario (grid de cards)
15. Componente image-uploader (drag & drop + click + preview)
16. Componente badge-picker (pills de presets + custom)
17. Formulario crear pieza (modal con todos los campos)
18. Editar pieza (reutilizar formulario)
19. Eliminar pieza (confirmación)
20. Toggle is_active (switch en cada card)

### Fase 4 — UX avanzado
21. Drag & drop para reordenar (@dnd-kit)
22. Live preview (frame de móvil con tu mosai)
23. Settings de perfil (display_name, bio, avatar upload)
24. Theme picker (selector visual con previews)
25. Copy link button con feedback animado

### Fase 5 — Página pública
26. Ruta dinámica `[username]/page.tsx` con SSR
27. Fetch profile + pieces activas ordenadas por position
28. Renderizar mosai-header (avatar + nombre + bio)
29. Renderizar mosai-grid con tema aplicado
30. Badges sobre imágenes con estilo del tema
31. Links con `target="_blank"` + `rel="noopener noreferrer"`
32. Footer con branding "Hecho con MOSAI"
33. Open Graph meta tags dinámicos
34. 404 custom si username no existe

### Fase 6 — Pulido final
35. Responsive: verificar dashboard en móvil
36. Loading states y skeletons en todo
37. Error handling graceful (toasts con sonner)
38. Micro-animaciones: hover, badge pop-in, transitions
39. Optimización de imágenes (sizes, priority flags)
40. Testing manual en móvil real (la experiencia que importa)

---

## 16. Decisiones de diseño clave

### ¿Por qué grid de 3 columnas y no 2?
- 3 columnas replica la experiencia visual de Instagram, que es familiar para todos los usuarios target
- Permite mostrar más contenido above-the-fold
- Las imágenes cuadradas en 3 cols se ven bien en cualquier móvil

### ¿Por qué aspect-ratio cuadrado por defecto?
- Consistencia visual — todas las piezas tienen el mismo tamaño
- Fácil de mantener el grid ordenado
- El tema "Film" usa 3:4 (vertical) como excepción para dar personalidad

### ¿Por qué badges y no solo texto?
- Los badges crean urgencia visual sin romper la estética
- Son opcionales — no ensucian si no los necesitas
- Ayudan a destacar contenido sin necesitar que el usuario escriba títulos largos

### ¿Por qué SSR para la página pública?
- Velocidad: la página carga con contenido ya renderizado
- SEO: los buscadores indexan el contenido del mosai
- Open Graph: las previews al compartir el link funcionan correctamente

---

*MOSAI — Tu link in bio, pero bonito. 🟧*
