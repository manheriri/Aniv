export const START_DATE = '2023-04-09'
export const CHAPTER_DATES = [
  '2026-11-03',
  '2026-11-04',
  '2026-11-05',
  '2026-11-06',
  '2026-11-07',
  '2026-11-08',
] as const

export const PREVIEW_KEY = 'cambiar-esta-clave'
export const HER_NAME = 'MI VIDA'
export const MY_NAME = 'Para mi persona favorita'
export const SITE_TITLE = 'Una semana para nosotros'

export const CHAPTERS = [
  {
    title: 'Donde empezó todo',
    tease: 'Una fecha que lo cambió todo',
    intro: 'Hay días que se quedan a vivir para siempre.',
    success: 'Ese día empezó todo. Desde entonces cada día contigo es mi favorito. Ojalá vivamos muchísimos 9 de abril más. Te quiero.',
    wrong: ['Casi… aunque esa fecha merece otra oportunidad.', 'No pasa nada, lo bonito es que tú también estabas allí.'],
    proofCaption: 'Así empezó nuestro primer plan.',
    proofPlaceholder: 'La captura de aquel «sí» aparecerá aquí.',
  },
  {
    title: 'Nuestro álbum',
    tease: 'Un pequeño viaje por nuestros recuerdos',
    intro: 'Mis recuerdos favoritos contigo.',
    albumHeading: 'Días que guardamos para siempre',
    anniversaryMilestone: 'Hoy hacemos 3 años y 7 meses ❤️',
    albumComplete: 'Ya he revivido nuestros recuerdos',
    albumThanks: 'Cada foto guarda un trocito de nosotros.',
  },
  {
    title: '¿Cuánto me conoces?',
    tease: 'Seis preguntas, cero presión (casi)',
    intro: 'A ver cuánto te acuerdas de mis pequeños grandes detalles.',
    firstTryResult: '¡Me conoces mejor que nadie! ❤️',
    retryResult: '¡Lo importante es que hemos llegado juntos hasta aquí! ❤️',
  },
  {
    title: 'Nuestros sitios',
    tease: 'Hay lugares que ya son un poco nuestros',
    intro: 'Escribe 3 sitios en los que ya hayamos estado juntos.',
    unknownPlace: 'Ahí todavía no… ¿apuntado para el próximo viaje?',
    repeatedPlace: 'Ese ya lo tenemos en el pasaporte ❤️',
    mapTitle: 'El mundo se nos queda pequeño',
  },
  {
    title: 'Lo que no te digo suficiente',
    tease: 'Una imagen guarda algo que quiero decirte',
    intro: 'Junta las piezas y abre tu carta.',
    holdHint: 'Mantén pulsado para ver la imagen original',
  },
  {
    title: 'El final',
    tease: 'Una última sorpresa te espera',
    intro: 'Rasca aquí para descubrir tu regalo.',
    reveal: 'Nos vamos de comida romántica para celebrarlo ❤️',
    ending: 'Seis capítulos, un montón de recuerdos y todavía todo lo que nos queda por vivir.',
  },
] as const

export const QUIZ_QUESTIONS = [
  {
    question: '¿Cuándo es mi cumpleaños?',
    options: ['6 de septiembre de 1997', '14 de febrero de 1998', '21 de junio de 1997', '30 de noviembre de 1996'],
    correctIndex: 0,
    correctMessage: '¡Me encantan los regalitos que me haces jijijiji!',
    wrongMessage: 'Mi tarta imaginaria se ha quedado esperando…',
  },
  {
    question: '¿Dónde fue nuestro primer beso?',
    options: ['Calle Radio Sevilla', 'Plaza de España', 'Calle Betis', 'Alameda de Hércules'],
    correctIndex: 0,
    correctMessage: 'Un sitio normal que para mí ya no lo es.',
    wrongMessage: 'Cerca, pero ese recuerdo tiene una calle concreta.',
  },
  {
    question: '¿Cuál es mi equipo favorito?',
    options: ['Sevilla FC', 'Real Betis', 'Cádiz CF', 'Granada CF'],
    correctIndex: 0,
    correctMessage: '¡Me encanta haberte devuelto un poquitín ese sentimiento!',
    wrongMessage: 'Uy, esa respuesta puede iniciar un derbi…',
  },
  {
    question: '¿Cuál fue el primer sitio al que fuimos a comer?',
    options: ['El Pantera de San Lorenzo', 'La Vicenta', 'La casa del tigre', 'Eslava'],
    correctIndex: 0,
    correctMessage: 'Y ahora tenemos una lámina del sitio.',
    wrongMessage: 'Se nos ha mezclado el menú de los recuerdos.',
  },
  {
    question: '¿Cuál fue nuestra primera escapada?',
    options: ['Matalascañas', 'Córdoba', 'Carmona', 'Ronda'],
    correctIndex: 0,
    correctMessage: '¡Para mi era un sueño hacer una escapadita contigo!',
    wrongMessage: 'Piensa en mar, carretera y nosotros dos.',
  },
  {
    question: '¿Cuándo te dije «te quiero» por primera vez?',
    options: ['Volviendo de Matalascañas', 'En nuestra primera cena', 'En una llamada de madrugada', 'En la estación de tren'],
    correctIndex: 0,
    correctMessage: 'TOP momentos de estar nervioso.',
    wrongMessage: 'La respuesta está en el camino de vuelta.',
  },
] as const

export const PLACES = [
  { name: 'Lisboa', aliases: ['lisboa'], lat: 38.7223, lng: -9.1393, photo: 'lisboa' },
  { name: 'Asturias', aliases: ['asturias', 'oviedo'], lat: 43.3614, lng: -5.8494, photo: 'asturias' },
  { name: 'Cádiz', aliases: ['cadiz'], lat: 36.5271, lng: -6.2886, photo: 'cadiz' },
  { name: 'Madrid', aliases: ['madrid', 'mdrid'], lat: 40.4168, lng: -3.7038, photo: 'mdrid' },
  { name: 'Londres', aliases: ['londres', 'london'], lat: 51.5072, lng: -0.1276, photo: 'londres' },
  { name: 'Marrakech', aliases: ['marrakech', 'marrakesh', 'marraquech', 'marrakeck'], lat: 31.6295, lng: -7.9811, photo: 'marrakech' },
  { name: 'Cuba', aliases: ['cuba', 'la habana', 'habana'], lat: 21.5218, lng: -77.7812, photo: 'cuba' },
  { name: 'Colombia', aliases: ['colombia'], lat: 4.5709, lng: -74.2973, photo: 'colombia' },
  { name: 'Lanzarote', aliases: ['lanzarote'], lat: 29.0469, lng: -13.5899, photo: 'lanzarote' },
  { name: 'Tavira', aliases: ['tavira'], lat: 37.1273, lng: -7.6498, photo: 'tavira' },
  { name: 'Santander', aliases: ['santander'], lat: 43.4623, lng: -3.80998, photo: 'santander' },
  { name: 'Matalascañas', aliases: ['matalascanas'], lat: 37.0007, lng: -6.5706, photo: 'matalascañas' },
  { name: 'Galicia', aliases: ['galicia'], lat: 42.8782, lng: -8.5448, photo: 'galicia' },
  { name: 'Córdoba', aliases: ['cordoba'], lat: 37.8882, lng: -4.7794, photo: 'córdoba' },
  { name: 'Costa Brava', aliases: ['costa brava'], lat: 41.9, lng: 3.2, photo: 'costa brava' },
  { name: 'Castro Urdiales', aliases: ['castro urdiales'], lat: 43.3829, lng: -3.2206, photo: 'castro urdiales' },
  { name: 'Bilbao', aliases: ['bilbao', 'bilao'], lat: 43.263, lng: -2.935, photo: 'bilao' },
  { name: 'Aracena', aliases: ['aracena'], lat: 37.8933, lng: -6.5616, photo: 'aracena' },
] as const

export const TIMELINE_CAPTIONS: Record<string, string> = {
  '23042023': 'Nuestra primera Feria',
  '06052023': 'Primera escapadita, con declaraciones importantes jejeje',
  '13052023': 'Segunda escapadita, todavía me acuerdo de la barra del bar de Córdoba jajajaja',
  '22062023': 'Primeros paseítos en Bilbao, qué época tan bonita',
  '05082023': 'JMJ: haciendo juntos el camino',
  '31082023': 'Escapadita a Castro, gracias Verano Joven',
  '01092023': 'Esas fideuás quedarán siempre en la memoria y en nuestros paladares',
  '18112023': 'Primera bodita juntos',
  '16042024': 'Una Feria más juntitos',
  '12052024': 'En esa escapada descubrimos un lugar único para nosotros',
  '19052024': 'Últimos días en Bilbao y animando a nuestro Sevilla',
  '22092024': '¡Tradición de perros calientes inaugurada!',
  '22102024': 'Una bromita que ojalá se haga realidad',
  '01032025': 'Un on tour más a nuestras espaldas',
  '17042025': 'La mantilla más guapa de Sevilla iba conmigo ese día',
  '14062025': 'Una bodita más',
  '20092025': 'Y otra, de la que me llevo este beso',
  '28092025': 'Otro día más con una de nuestras pasiones',
  '06102025': 'Y por fin, compartimos hermandad',
  '12042026': 'Un eventito en el que ibas guapísima',
  '24042026': 'Una Feria más... y las que quedan',
  '09052026': 'Sevilla una vez más...',
  '05062026': 'Un Corpus muy especial con mi bonita',
  '28092026': 'Mi EMPRENDEDORA FAVORITA',
}

export const TIMELINE_ORDER = [
  '23042023', '06052023', '13052023', '22062023', '05082023', '31082023', '01092023', '18112023',
  '16042024', '12052024', '19052024', '22092024', '22102024',
  '01032025', '17042025', '14062025', '20092025', '28092025', '06102025',
  '12042026', '24042026', '09052026', '05062026', '28092026',
]