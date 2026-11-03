# Una semana para nosotros

Calendario de aniversario de seis capítulos, hecho con Vite, React y TypeScript. Todo funciona en el navegador; el avance normal se guarda en `localStorage` del dispositivo.

## Empezar

Necesitas Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev
```

Para verificar la versión de producción: `npm run build`. El resultado queda en `dist/`.

## Personalizar

Edita [src/config.ts](src/config.ts): `HER_NAME`, `MY_NAME`, `SITE_TITLE`, `START_DATE`, `PREVIEW_KEY`, las fechas, los textos y las preguntas, los lugares y sus coordenadas, y los pies de foto. Los nombres de las preguntas y opciones pueden cambiarse sin tocar los componentes. En `TIMELINE_CAPTIONS`, usa la fecha del nombre del archivo sin extensión, por ejemplo `23042023`.

La prueba del primer día acepta `09/04/2023`, `9-4-2023`, `09042023` y `9/4/23`; al cambiar `START_DATE`, actualiza también el texto del capítulo en `CHAPTERS[0].success`.

## Fotos y carta

Deja los archivos en estas carpetas; se detectan automáticamente al compilar:

- `src/content/linea-de-tiempo/`: `ddmmaaaa.jpg`, por ejemplo `23042023.JPG`. El capítulo del álbum muestra los pies editables de `TIMELINE_CAPTIONS` en el orden definido allí, sin prueba de ordenar fotos. Se aceptan extensiones en mayúsculas o minúsculas.
- `src/content/viajes/`: una foto por destino. Se admiten nombres con mayúsculas, espacios y tildes, como `Costa Brava.JPG` o `Córdoba.JPG`; el destino debe corresponder al `photo` de `PLACES` (Madrid y Bilbao también reconocen los nombres de archivo `Mdrid` y `Bilao`).
- `src/content/puzzle/`: `puzzle.JPG` (también admite `.jpg`, `.jpeg`, `.png` y `.webp`, en mayúsculas o minúsculas).
- `src/content/confirmacion/`: la captura de WhatsApp que aparecerá al resolver la prueba de la fecha; por ejemplo, `captura-whatsapp.jpg` (admite `.jpg`, `.jpeg`, `.png` o `.webp`).
- `src/content/carta.txt`: reemplaza el texto de ejemplo; se respetan los saltos de línea.
- Música opcional: coloca una copia de audio que tengas derecho a usar en `public/audio/heaven.mp3`. El botón del álbum inicia y pausa la reproducción en bucle; en móvil hay que tocarlo porque el navegador bloquea el autoplay.

Sin fotos, el álbum, el mapa y el puzzle muestran espacios visuales de sustitución y las pruebas siguen siendo completables. Recomiendo reducir las fotos a unos 1600 px en el lado largo y comprimirlas en JPEG o WebP; las fotos originales de fechas y viajes ocupan unos 96 MB en conjunto. Evita HEIC, que no está soportado.

La web solo reproduce el archivo de audio que añadas: no incluye ni descarga la canción comercial. Para publicarla, usa una copia cuyo uso y distribución tengas autorizados.

## Vista previa

Usa `http://localhost:5173/?preview=cambiar-esta-clave` durante desarrollo. Sustituye `cambiar-esta-clave` por `PREVIEW_KEY` en `src/config.ts`. Preview abre los seis capítulos sin mirar las fechas ni leer o guardar progreso. Para abrir una sección directamente, añade `&capitulo=1` a `&capitulo=6`; por ejemplo:

```text
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=1
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=2
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=3
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=4
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=5
https://TU-PROYECTO.vercel.app/?preview=TU_CLAVE&capitulo=6
```

Preview no guarda progreso; la URL es para probar y no debe considerarse privada: una SPA no puede ocultar la clave incluida en su JavaScript público. En el modo normal, toca cinco veces el título de la cabecera para mostrar la opción de reinicio.

Las fechas se comparan usando `Europe/Madrid`, y cada capítulo requiere que haya llegado su día y que el anterior esté completado. El progreso normal se guarda únicamente en el almacenamiento local de ese navegador; no se sincroniza entre dispositivos.

## Desplegar gratis en Vercel con GitHub privado

1. Crea un repositorio **Private** en GitHub. No publiques las fotos personales en un repositorio público.
2. Desde esta carpeta, inicializa y sube el proyecto (cambia los marcadores por los datos de tu repo):

   ```bash
   git init
   git add .
   git commit -m "Create anniversary surprise"
   git branch -M main
   git remote add origin https://github.com/USUARIO/REPOSITORIO.git
   git push -u origin main
   ```

3. En Vercel Hobby (plan gratuito para proyectos personales), elige **Add New → Project**, conecta GitHub y autoriza el acceso al repositorio privado que acabas de crear.
4. Importa ese repositorio. Selecciona **Vite** si Vercel no lo detecta automáticamente; usa `npm install` como instalación, `npm run build` como comando de build y `dist` como directorio de salida.
5. Pulsa **Deploy**. Vercel te dará un enlace que puedes enviar por WhatsApp. Los siguientes `git push` a `main` publican una actualización automáticamente.

**Privacidad:** el repositorio privado oculta el código fuente, pero esta app no tiene inicio de sesión ni backend. Las fotos y el contenido del sitio publicado pueden ser vistos por cualquier persona que tenga el enlace (y no debe considerarse un enlace secreto). No subas contenido que deba permanecer confidencial.