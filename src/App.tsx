import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import carta from './content/carta.txt?raw'
import {
  CHAPTERS,
  CHAPTER_DATES,
  HER_NAME,
  MY_NAME,
  PLACES,
  PREVIEW_KEY,
  QUIZ_QUESTIONS,
  SITE_TITLE,
  START_DATE,
  TIMELINE_CAPTIONS,
  TIMELINE_ORDER,
} from './config'

const STORAGE_KEY = 'aniversario-progreso-v1'
const timelineFiles = import.meta.glob('./content/linea-de-tiempo/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const puzzleFiles = import.meta.glob('./content/puzzle/puzzle.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const puzzleImage = Object.values(puzzleFiles)[0]
const confirmationFiles = import.meta.glob('./content/confirmacion/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const confirmationImage = Object.values(confirmationFiles)[0]
const PlacesMap = lazy(() => import('./PlacesMap'))

type TimelineMemory = {
  id: string
  filename: string
  image?: string
  dateKey: string
  year: number
  dateLabel: string
  caption: string
  placeholder?: boolean
}

function safeReadProgress(): number[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is number => Number.isInteger(item) && item >= 0 && item < 6)
  } catch {
    return []
  }
}

function safeWriteProgress(progress: Set<number>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...progress]))
  } catch {
    // Progress remains available for the current page session.
  }
}

function safeClearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Resetting the in-memory state still works when storage is unavailable.
  }
}

function madridParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') }
}

function madridToday() {
  const { year, month, day } = madridParts()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dateAfterMonths(dateString: string, months: number) {
  const [year, month, day] = dateString.split('-').map(Number)
  const result = new Date(Date.UTC(year, month - 1 + months, day))
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, '0')}-${String(result.getUTCDate()).padStart(2, '0')}`
}

const THREE_YEARS_SEVEN_MONTHS_DATE = dateAfterMonths(START_DATE, 43)

function madridMidnight(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  let timestamp = Date.UTC(year, month - 1, day)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  })

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = formatter.formatToParts(new Date(timestamp))
    const part = (type: string) => Number(parts.find((item) => item.type === type)?.value ?? 0)
    const representedAsUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'))
    timestamp += Date.UTC(year, month - 1, day) - representedAsUtc
  }

  return timestamp
}

function prettyDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)))
}

function chapterDateLabel(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)))
}

function buildTimeline(): TimelineMemory[] {
  const captionOrder = new Map(TIMELINE_ORDER.map((dateKey, index) => [dateKey, index]))
  const memories = Object.entries(timelineFiles).flatMap(([path, image]) => {
    const filename = path.split('/').pop() ?? path
    const match = filename.match(/^(\d{2})(\d{2})(\d{4})(?:-(\d+))?\.(?:jpg|jpeg|png|webp)$/i)
    if (!match) return []
    const [, dayText, monthText, yearText] = match
    const day = Number(dayText)
    const month = Number(monthText)
    const year = Number(yearText)
    const check = new Date(Date.UTC(year, month - 1, day))
    if (check.getUTCDate() !== day || check.getUTCMonth() !== month - 1) return []
    const dateKey = `${dayText}${monthText}${yearText}`
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const captionKey = dateKey
    return [{
      id: filename,
      filename,
      image,
      dateKey,
      year,
      dateLabel: prettyDate(dateString),
      caption: TIMELINE_CAPTIONS[captionKey] ?? '',
    }]
  })
  return memories.sort((left, right) => (captionOrder.get(left.dateKey) ?? Number.MAX_SAFE_INTEGER) - (captionOrder.get(right.dateKey) ?? Number.MAX_SAFE_INTEGER))
}

const timeline = buildTimeline()

function makeHeartConfetti() {
  const shape = confetti.shapeFromText({ text: '♥', scalar: 1.5 })
  void confetti({
    particleCount: 85,
    spread: 78,
    startVelocity: 34,
    origin: { y: 0.68 },
    colors: ['#9e4058', '#ce7b86', '#e7ac9a', '#d2a84f'],
    shapes: [shape],
    scalar: 1.15,
  })
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim().replace(/\s+/g, ' ')
}

function parseFlexibleDate(input: string) {
  const value = input.trim()
  let day: number
  let month: number
  let year: number
  if (/^\d{8}$/.test(value)) {
    day = Number(value.slice(0, 2))
    month = Number(value.slice(2, 4))
    year = Number(value.slice(4))
  } else {
    const match = value.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2}|\d{4})$/)
    if (!match) return ''
    day = Number(match[1])
    month = Number(match[2])
    year = Number(match[3])
    if (year < 100) year += year < 50 ? 2000 : 1900
  }
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function shuffle<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return shuffled
}

function useAnniversaryClock() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const current = madridParts(new Date(now))
  const start = START_DATE.split('-').map(Number)
  const currentDate = Date.UTC(current.year, current.month - 1, current.day)
  let years = current.year - start[0]
  let anniversaryYear = new Date(Date.UTC(start[0] + years, start[1] - 1, start[2]))
  if (anniversaryYear.getTime() > currentDate) years -= 1
  let cursor = new Date(Date.UTC(start[0] + years, start[1] - 1, start[2]))
  let months = 0
  while (months < 11) {
    const candidate = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, start[2]))
    if (candidate.getTime() > currentDate) break
    cursor = candidate
    months += 1
  }
  const days = Math.floor((currentDate - cursor.getTime()) / 86_400_000)
  return { years, months, days, hours: current.hour, minutes: current.minute, seconds: current.second }
}

function useCountdown(date: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const remaining = Math.max(0, madridMidnight(date) - now)
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1000)
  return { days, hours, minutes, seconds, arrived: remaining === 0 }
}

function Duration({ label, value }: { label: string; value: number }) {
  return <span className="duration-unit"><strong>{String(value).padStart(2, '0')}</strong><small>{label}</small></span>
}

function Header({ preview, onTitleTap }: { preview: boolean; onTitleTap: () => void }) {
  const time = useAnniversaryClock()
  return (
    <header className="site-header">
      <button className="brand-mark" onClick={onTitleTap} aria-label="Inicio. Toca cinco veces para opciones especiales.">
        <span>Esta semana más que nunca eres lo principal</span>
      </button>
      <div className="together-clock" aria-label="Tiempo juntos">
        <span className="clock-label">NUESTRA HISTORIA LLEVA:</span>
        <div className="clock-values">
          <Duration label="años" value={time.years} />
          <Duration label="meses" value={time.months} />
          <Duration label="días" value={time.days} />
          <Duration label="h" value={time.hours} />
          <Duration label="min" value={time.minutes} />
          <Duration label="seg" value={time.seconds} />
        </div>
      </div>
      {preview && <span className="preview-tag">Vista previa</span>}
    </header>
  )
}

function Countdown({ date }: { date: string }) {
  const time = useCountdown(date)
  return <span className="countdown">{time.arrived ? '00:00:00' : `${time.days ? `${time.days}d ` : ''}${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`}</span>
}

function Completion({ children }: { children: string }) {
  return (
    <motion.div className="completion-note" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <span className="completion-heart">♥</span>
      <p>{children}</p>
      <small>Vuelve mañana para el siguiente capítulo</small>
    </motion.div>
  )
}

function ChapterOne({ onComplete }: { onComplete: () => void }) {
  const [answer, setAnswer] = useState('')
  const [mistakes, setMistakes] = useState(0)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  const [typed, setTyped] = useState('')
  const fullMessage = CHAPTERS[0].success

  useEffect(() => {
    if (!complete) return
    let position = 0
    const timer = window.setInterval(() => {
      position += 1
      setTyped(fullMessage.slice(0, position))
      if (position >= fullMessage.length) window.clearInterval(timer)
    }, 34)
    return () => window.clearInterval(timer)
  }, [complete, fullMessage])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (parseFlexibleDate(answer) === START_DATE) {
      setComplete(true)
      onComplete()
      makeHeartConfetti()
      return
    }
    const nextMistakes = mistakes + 1
    setMistakes(nextMistakes)
    setError(CHAPTERS[0].wrong[(nextMistakes - 1) % CHAPTERS[0].wrong.length])
  }

  if (complete) return <div className="answer-reveal"><div className="reveal-sparkle">✦</div><p className="typewriter-message">{typed}<span className="typing-cursor">|</span></p>{confirmationImage ? <figure className="date-proof"><img src={confirmationImage} alt="Captura de WhatsApp del día que decidimos quedar" /><figcaption>{CHAPTERS[0].proofCaption}</figcaption></figure> : <div className="date-proof-placeholder"><span>♥</span><p>{CHAPTERS[0].proofPlaceholder}</p></div>}<Completion>Este fue solo el principio.</Completion></div>
  return (
    <form className="challenge-form" onSubmit={submit}>
      <label htmlFor="start-date-answer">¿Qué día empezó nuestra historia?</label>
      <p className="field-hint">Puedes escribirla con barras, guiones o toda seguida.</p>
      <div className="input-action-row">
        <input id="start-date-answer" autoComplete="off" inputMode="numeric" placeholder="dd / mm / aaaa" value={answer} onChange={(event) => { setAnswer(event.target.value); setError('') }} />
        <button className="button button-primary" type="submit">Comprobar <span aria-hidden="true">↗</span></button>
      </div>
      <AnimatePresence mode="wait">{error && <motion.p className="feedback feedback-warm" key={error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.p>}</AnimatePresence>
    </form>
  )
}

function TimelineCard({ memory, index, onOpen }: { memory: TimelineMemory; index: number; onOpen: (memory: TimelineMemory) => void }) {
  return (
    <motion.article className="album-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.35, delay: (index % 4) * 0.04 }}>
      <button className="memory-photo" onClick={() => onOpen(memory)} aria-label={`Ampliar foto del ${memory.dateLabel}`}>
        {memory.image ? <img src={memory.image} alt={memory.caption || `Recuerdo del ${memory.dateLabel}`} loading="lazy" /> : <span className="photo-placeholder"><span>✦</span><small>Una foto nuestra irá aquí</small></span>}
        <span className="photo-zoom" aria-hidden="true">↗</span>
      </button>
      <div className="memory-caption"><time>{memory.dateLabel}</time><p>{memory.caption || 'Un día que guardamos para siempre.'}</p></div>
    </motion.article>
  )
}

function TimelineChallenge({ onComplete }: { onComplete: () => void }) {
  const [lightbox, setLightbox] = useState<TimelineMemory | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageDirection, setPageDirection] = useState(1)
  const [done, setDone] = useState(false)
  const years = [...new Set(timeline.map((memory) => memory.year))]
  const visibleMemories = selectedYear === null ? timeline : timeline.filter((memory) => memory.year === selectedYear)
  const pageCount = Math.ceil(visibleMemories.length / 2)
  const pageMemories = visibleMemories.slice(pageIndex * 2, pageIndex * 2 + 2)

  function changePage(direction: number) {
    setPageDirection(direction)
    setPageIndex((current) => Math.max(0, Math.min(pageCount - 1, current + direction)))
  }

  function changeYear(year: number | null) {
    setSelectedYear(year)
    setPageIndex(0)
  }

  function finishAlbum() {
    setDone(true)
    onComplete()
    makeHeartConfetti()
  }

  return (
    <>
      <section className="timeline-section">
        <div className="section-heading"><span className="eyebrow">NUESTRO ÁLBUM</span><h3>{CHAPTERS[1].albumHeading}</h3><p>{timeline.length} recuerdos que siempre me gusta volver a mirar.</p></div>
        <AlbumMusic />
        {timeline.length ? <>
          <div className="album-years" role="group" aria-label="Filtrar recuerdos por año">
            <button className={selectedYear === null ? 'year-selected' : ''} onClick={() => changeYear(null)} aria-pressed={selectedYear === null}>Todos</button>
            {years.map((year) => <button key={year} className={selectedYear === year ? 'year-selected' : ''} onClick={() => changeYear(year)} aria-pressed={selectedYear === year}>{year}</button>)}
          </div>
          <div className="album-book">
            <div className="album-book-spread">
              <AnimatePresence mode="wait" custom={pageDirection}>
                <motion.div
                  key={`${selectedYear ?? 'all'}-${pageIndex}`}
                  className="album-book-page"
                  custom={pageDirection}
                  variants={{
                    enter: (direction: number) => ({ opacity: 0.7, rotateY: direction > 0 ? -170 : 170, transformOrigin: direction > 0 ? '0% 50%' : '100% 50%', boxShadow: '0 20px 34px rgba(48, 34, 29, .32)' }),
                    center: { opacity: 1, rotateY: 0, transformOrigin: '50% 50%', boxShadow: '0 2px 6px rgba(48, 34, 29, .08)' },
                    exit: (direction: number) => ({ opacity: 0.65, rotateY: direction > 0 ? 170 : -170, transformOrigin: direction > 0 ? '0% 50%' : '100% 50%', boxShadow: '0 20px 34px rgba(48, 34, 29, .32)' }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.62, ease: [0.35, 0, 0.2, 1] }}
                >
                  <div className="album-grid">{pageMemories.map((memory, index) => <TimelineCard key={memory.id} memory={memory} index={pageIndex * 2 + index} onOpen={setLightbox} />)}</div>
                </motion.div>
              </AnimatePresence>
            </div>
            <nav className="album-pagination" aria-label="Pasar páginas del álbum">
              <button onClick={() => changePage(-1)} disabled={pageIndex === 0} aria-label="Página anterior"><span aria-hidden="true">←</span><small>Anterior</small></button>
              <span aria-live="polite"><strong>{pageIndex + 1}</strong><small> / {pageCount}</small></span>
              <button onClick={() => changePage(1)} disabled={pageIndex >= pageCount - 1} aria-label="Página siguiente"><small>Siguiente</small><span aria-hidden="true">→</span></button>
            </nav>
          </div>
        </> : <div className="empty-album"><span>✦</span><p>Aquí aparecerán nuestras fotos favoritas cuando las pongamos en la carpeta del álbum.</p></div>}
      </section>
      <div className="album-finish">
        {!done ? <button className="button button-primary" onClick={finishAlbum}>{CHAPTERS[1].albumComplete} <span aria-hidden="true">✓</span></button> : <Completion>{CHAPTERS[1].albumThanks}</Completion>}
      </div>
      <AnimatePresence>{lightbox && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}><button className="lightbox-close" aria-label="Cerrar foto">×</button>{lightbox.image ? <img src={lightbox.image} alt={lightbox.caption || lightbox.dateLabel} /> : <div className="lightbox-placeholder">Una foto nuestra irá aquí</div>}<p>{lightbox.caption || lightbox.dateLabel}</p></motion.div>}</AnimatePresence>
    </>
  )
}

function AlbumMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/audio/heaven.mp3', { method: 'HEAD' })
      .then((response) => {
        const contentType = response.headers.get('content-type') ?? ''
        if (active) setUnavailable(!response.ok || !contentType.startsWith('audio/'))
      })
      .catch(() => {
        if (active) setUnavailable(true)
      })
    return () => { active = false }
  }, [])

  async function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }
    audio.volume = 0.24
    try {
      await audio.play()
      setPlaying(true)
      setUnavailable(false)
    } catch {
      setUnavailable(true)
    }
  }

  return (
    <div className="album-music">
      <audio ref={audioRef} src="/audio/heaven.mp3" loop preload="none" onError={() => setUnavailable(true)} onCanPlay={() => setUnavailable(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button className="music-toggle" onClick={toggleMusic} aria-pressed={playing} disabled={unavailable}><span aria-hidden="true">{playing ? 'Ⅱ' : '♫'}</span>{playing ? 'Pausar música' : 'Reproducir canción'}</button>
      <span className="music-note">Heaven · Bryan Adams</span>
      {unavailable && <small className="music-unavailable">Añade una copia autorizada en <code>public/audio/heaven.mp3</code>. En móvil, pulsa reproducir para empezar.</small>}
    </div>
  )
}

type QuizQuestion = typeof QUIZ_QUESTIONS[number]
type QuizRound = { question: QuizQuestion; options: string[] }

function createQuizRounds(questions: readonly QuizQuestion[]): QuizRound[] {
  return questions.map((question) => ({ question, options: shuffle([...question.options]) }))
}

function QuizChallenge({ onComplete }: { onComplete: () => void }) {
  const [queue, setQueue] = useState<QuizRound[]>(() => createQuizRounds(QUIZ_QUESTIONS))
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [firstTryCount, setFirstTryCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const current = queue[index]

  function choose(option: string) {
    if (!current || feedback) return
    const isRight = option === current.question.options[current.question.correctIndex]
    setFeedback(isRight ? current.question.correctMessage : current.question.wrongMessage)
    if (isRight) {
      if (index < QUIZ_QUESTIONS.length) setFirstTryCount((count) => count + 1)
      window.setTimeout(() => {
        setFeedback('')
        if (index + 1 >= queue.length) {
          setComplete(true)
          onComplete()
          makeHeartConfetti()
        } else setIndex((value) => value + 1)
      }, 1050)
    } else {
      setWrongCount((count) => count + 1)
      setQueue((items) => [...items, current])
      window.setTimeout(() => {
        setFeedback('')
        setIndex((value) => value + 1)
      }, 1150)
    }
  }

  if (complete) return <div className="quiz-result"><span className="result-seal">♥</span><h3>{wrongCount === 0 ? CHAPTERS[2].firstTryResult : CHAPTERS[2].retryResult}</h3><p>{firstTryCount} de {QUIZ_QUESTIONS.length} respuestas a la primera</p><Completion>Te quiero como a nadie.</Completion></div>
  return (
    <section className="quiz-panel">
      <div className="quiz-progress-line"><span style={{ width: `${Math.min(100, (index / queue.length) * 100)}%` }} /></div>
      <div className="quiz-step">PREGUNTA {Math.min(index + 1, queue.length)} <span>/ {queue.length}</span></div>
      <AnimatePresence mode="wait"><motion.div key={`${index}-${current?.question.question}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
        <h3 className="quiz-question">{current?.question.question}</h3>
        <div className="quiz-options">{current?.options.map((option, optionIndex) => <button key={`${option}-${optionIndex}`} onClick={() => choose(option)} disabled={Boolean(feedback)}>{String.fromCharCode(65 + optionIndex)}<span>{option}</span><b>↗</b></button>)}</div>
      </motion.div></AnimatePresence>
      <AnimatePresence>{feedback && <motion.p className="quiz-feedback" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{feedback}</motion.p>}</AnimatePresence>
    </section>
  )
}

function PlacesChallenge({ onComplete }: { onComplete: () => void }) {
  const [value, setValue] = useState('')
  const [found, setFound] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const complete = found.length >= 3

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeText(value)
    const match = PLACES.find((place) => place.aliases.some((alias) => normalizeText(alias) === normalized))
    if (!match) setMessage(CHAPTERS[3].unknownPlace)
    else if (found.includes(match.photo)) setMessage(CHAPTERS[3].repeatedPlace)
    else {
      const next = [...found, match.photo]
      setFound(next)
      setMessage(`✈ ${match.name} se queda en nuestro mapa.`)
      if (next.length === 3) {
        onComplete()
        makeHeartConfetti()
      }
    }
    setValue('')
  }

  if (complete) return <Suspense fallback={<div className="map-loading">Preparando nuestro mapa…</div>}><PlacesMap /></Suspense>
  return (
    <section className="places-challenge">
      <p className="places-intro">{CHAPTERS[3].intro}</p>
      <div className="place-chips" aria-live="polite">{found.map((photo) => <span className="place-chip" key={photo}>✈ {PLACES.find((place) => place.photo === photo)?.name}</span>)}{Array.from({ length: 3 - found.length }, (_, index) => <span className="place-chip chip-empty" key={`empty-${index}`}>?</span>)}</div>
      <form className="input-action-row" onSubmit={submit}>
        <label className="sr-only" htmlFor="place-answer">Nombre de un lugar</label>
        <input id="place-answer" value={value} onChange={(event) => { setValue(event.target.value); setMessage('') }} placeholder="Escribe un lugar…" autoComplete="off" />
        <button className="button button-primary" type="submit">Añadir <span aria-hidden="true">＋</span></button>
      </form>
      <AnimatePresence mode="wait">{message && <motion.p className={`feedback ${found.length && message.startsWith('✈') ? 'feedback-success' : 'feedback-warm'}`} key={message} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{message}</motion.p>}</AnimatePresence>
    </section>
  )
}

function makePuzzleOrder() {
  let order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])
  while (order.every((value, index) => value === index)) order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8])
  return order
}

function LetterReveal() {
  const [textIndex, setTextIndex] = useState(0)
  const [skip, setSkip] = useState(false)
  const text = carta.trim()
  useEffect(() => {
    if (skip) return
    let position = 0
    const timer = window.setInterval(() => {
      position += 1
      setTextIndex(position)
      if (position >= text.length) {
        setSkip(true)
        window.clearInterval(timer)
      }
    }, 24)
    return () => window.clearInterval(timer)
  }, [skip, text.length])
  return (
    <motion.section className="letter-reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="envelope"><span>♥</span></div>
      <div className="letter-paper">
        <p>{skip ? text : text.slice(0, textIndex)}</p>
        {!skip && <button className="text-button" onClick={() => setSkip(true)}>Saltar efecto de escritura</button>}
      </div>
    </motion.section>
  )
}

function PuzzleChallenge({ onComplete }: { onComplete: () => void }) {
  const [order, setOrder] = useState(makePuzzleOrder)
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [showOriginal, setShowOriginal] = useState(false)
  const [solved, setSolved] = useState(false)

  function tapPiece(index: number) {
    if (solved) return
    if (selected === null) setSelected(index)
    else if (selected === index) setSelected(null)
    else {
      const next = [...order]
      ;[next[selected], next[index]] = [next[index], next[selected]]
      setOrder(next)
      setSelected(null)
      setMoves((count) => count + 1)
      if (next.every((piece, position) => piece === position)) {
        setSolved(true)
        onComplete()
        makeHeartConfetti()
      }
    }
  }

  return (
    <section className="puzzle-challenge">
      {!solved ? <>
        <div className="puzzle-board" aria-label="Puzzle de nueve piezas">
          {order.map((piece, position) => <button key={position} className={`puzzle-piece${selected === position ? ' piece-selected' : ''}`} onClick={() => tapPiece(position)} aria-label={`Pieza ${position + 1}${selected === position ? ', seleccionada' : ''}`} style={puzzleImage ? { backgroundImage: `url("${puzzleImage}")`, backgroundPosition: `${(piece % 3) * 50}% ${Math.floor(piece / 3) * 50}%` } : { background: `hsl(${(piece * 37 + 8) % 360} 32% ${68 + (piece % 3) * 5}%)` }}>
            {!puzzleImage && <span>{piece + 1}</span>}
          </button>)}
          {showOriginal && puzzleImage && <div className="original-preview" style={{ backgroundImage: `url("${puzzleImage}")` }} />}
        </div>
        {!puzzleImage && <p className="field-hint puzzle-hint">Añade puzzle.jpg para jugar con vuestra foto.</p>}
        <div className="puzzle-tools"><span>{moves} {moves === 1 ? 'movimiento' : 'movimientos'}</span><button className="hold-preview" onPointerDown={(event) => { event.preventDefault(); setShowOriginal(true) }} onPointerUp={() => setShowOriginal(false)} onPointerLeave={() => setShowOriginal(false)} onPointerCancel={() => setShowOriginal(false)}>{CHAPTERS[4].holdHint}</button></div>
      </> : <>
        <motion.div className="solved-photo" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={puzzleImage ? { backgroundImage: `url("${puzzleImage}")` } : undefined}>{!puzzleImage && <span>La foto de vuestro puzzle va aquí</span>}</motion.div>
        <LetterReveal />
        <Completion>Y esto también quería que lo supieras.</Completion>
      </>}
    </section>
  )
}

function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [scratching, setScratching] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { willReadFrequently: true })
    if (!canvas || !context) return
    canvas.width = 720
    canvas.height = 390
    const gradient = context.createLinearGradient(0, 0, 720, 390)
    gradient.addColorStop(0, '#d7b661')
    gradient.addColorStop(0.52, '#efdfa8')
    gradient.addColorStop(1, '#c49a44')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(255,255,255,.32)'
    context.strokeStyle = 'rgba(116,76,45,.28)'
    context.lineWidth = 2
    for (let radius = 72; radius < 260; radius += 42) {
      context.beginPath()
      context.arc(360, 195, radius, 0, Math.PI * 2)
      context.stroke()
    }
    context.font = '600 30px "DM Sans", sans-serif'
    context.fillStyle = '#70484a'
    context.textAlign = 'center'
    context.fillText('RASCA PARA DESCUBRIR', 360, 185)
    context.font = '42px serif'
    context.fillText('♥', 360, 250)
  }, [])

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width), y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height) }
  }

  function scratch(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!scratching || revealed) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const current = point(event)
    context.globalCompositeOperation = 'destination-out'
    context.lineWidth = 54
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    if (lastPoint.current) context.moveTo(lastPoint.current.x, lastPoint.current.y)
    else context.moveTo(current.x, current.y)
    context.lineTo(current.x, current.y)
    context.stroke()
    lastPoint.current = current
    moves.current += 1
    if (moves.current % 4 === 0) checkReveal(canvas, context)
  }

  function checkReveal(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    if (revealed) return
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let transparent = 0
    let total = 0
    for (let index = 3; index < pixels.length; index += 4 * 16) {
      total += 1
      if (pixels[index] < 128) transparent += 1
    }
    if (transparent / total >= 0.6) {
      setRevealed(true)
      onReveal()
      makeHeartConfetti()
    }
  }

  function stopScratch() {
    setScratching(false)
    lastPoint.current = null
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) checkReveal(canvas, context)
  }

  return (
    <section className="scratch-area">
      <div className={`scratch-card${revealed ? ' scratch-revealed' : ''}`}>
        <div className="scratch-prize"><span className="prize-star">✦</span><p>{CHAPTERS[5].reveal}</p><small>Con todo mi amor, {MY_NAME}</small></div>
        {!revealed && <canvas ref={canvasRef} className="scratch-canvas" aria-label="Rasca la tarjeta para descubrir tu regalo" onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setScratching(true); lastPoint.current = point(event); scratch(event) }} onPointerMove={scratch} onPointerUp={stopScratch} onPointerCancel={stopScratch} />}
      </div>
      {revealed && <div className="week-finale"><span className="eyebrow">NUESTRA SEMANA</span><h3>{CHAPTERS[5].ending}</h3><div className="finale-chapters">{CHAPTERS.map((chapter, index) => <span key={chapter.title}><b>✓</b>{index + 1}</span>)}</div><p className="signoff">Para ti, {HER_NAME}.<br /><span>Con amor, {MY_NAME}</span></p></div>}
    </section>
  )
}

function ChapterContent({ index, onComplete }: { index: number; onComplete: () => void }) {
  if (index === 0) return <ChapterOne onComplete={onComplete} />
  if (index === 1) return <TimelineChallenge onComplete={onComplete} />
  if (index === 2) return <QuizChallenge onComplete={onComplete} />
  if (index === 3) return <PlacesChallenge onComplete={onComplete} />
  if (index === 4) return <PuzzleChallenge onComplete={onComplete} />
  return <ScratchCard onReveal={onComplete} />
}

function App() {
  const searchParams = new URLSearchParams(window.location.search)
  const preview = searchParams.get('preview') === PREVIEW_KEY
  const requestedChapter = Number(searchParams.get('capitulo'))
  const previewChapter = preview && Number.isInteger(requestedChapter) && requestedChapter >= 1 && requestedChapter <= CHAPTERS.length
    ? requestedChapter - 1
    : null
  const [completed, setCompleted] = useState<Set<number>>(() => new Set(preview ? [] : safeReadProgress()))
  const [selectedChapter, setSelectedChapter] = useState<number | null>(previewChapter)
  const [titleTaps, setTitleTaps] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    document.title = SITE_TITLE
  }, [])

  useEffect(() => {
    if (!preview) safeWriteProgress(completed)
  }, [completed, preview])

  useEffect(() => {
    if (preview || titleTaps < 5) return
    setTitleTaps(0)
    if (window.confirm('¿Reiniciar los seis capítulos?')) {
      safeClearProgress()
      setCompleted(new Set())
      setSelectedChapter(null)
      setNotice('El calendario vuelve a empezar. ♥')
    }
  }, [preview, titleTaps])

  function markComplete(index: number) {
    setCompleted((previous) => {
      const next = new Set(previous)
      next.add(index)
      return next
    })
  }

  function isUnlocked(index: number) {
    return preview || (madridToday() >= CHAPTER_DATES[index] && (index === 0 || completed.has(index - 1)))
  }

  function tapTitle() {
    setTitleTaps((count) => count + 1)
  }

  const current = selectedChapter === null ? null : CHAPTERS[selectedChapter]
  return (
    <div className="app-shell">
      <Header preview={preview} onTitleTap={tapTitle} />
      <main>
        <AnimatePresence mode="wait">
          {selectedChapter === null ? <motion.div className="home-view" key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <section className="welcome-block">
              <span className="eyebrow">3 — 8 NOVIEMBRE 2026 <i>✦</i> PARA {HER_NAME.toUpperCase()}</span>
              <h1>Seis días.<br /><em>Una historia.</em></h1>
              <p>Hola, {HER_NAME}. Te he guardado una sorpresa para cada día de esta semana. ♥</p>
              <div className="welcome-rule"><span /></div>
            </section>
            {madridToday() === THREE_YEARS_SEVEN_MONTHS_DATE && <motion.p className="anniversary-milestone" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{CHAPTERS[1].anniversaryMilestone}</motion.p>}
            <section className="calendar-section" aria-label="Calendario de capítulos">
              <div className="calendar-heading"><span className="eyebrow">NUESTRO CALENDARIO</span><span className="chapter-count">{completed.size} / 6 abiertos</span></div>
              <div className="chapter-grid">
                {CHAPTERS.map((chapter, index) => {
                  const unlocked = isUnlocked(index)
                  const done = completed.has(index)
                  return <motion.button key={chapter.title} className={`chapter-card${unlocked ? ' chapter-unlocked' : ' chapter-locked'}${done ? ' chapter-completed' : ''}`} onClick={() => unlocked && setSelectedChapter(index)} disabled={!unlocked} whileHover={unlocked ? { y: -3 } : undefined} whileTap={unlocked ? { scale: 0.99 } : undefined}>
                    <span className="chapter-topline"><span>0{index + 1}</span>{done ? <span className="status-icon" aria-label="Completado">✓</span> : unlocked ? <span className="status-icon status-open">↗</span> : <span className="status-icon lock-icon" aria-label="Bloqueado">⌑</span>}</span>
                    <span className="chapter-date">{chapterDateLabel(CHAPTER_DATES[index])}</span>
                    <strong>{chapter.title}</strong>
                    <span className="chapter-tease">{unlocked ? chapter.tease : `Algo se abre el ${chapterDateLabel(CHAPTER_DATES[index]).split(' ')[0]}…`}</span>
                    {!unlocked && <span className="card-countdown"><span>{madridToday() < CHAPTER_DATES[index] ? 'Se abre en' : 'Completa el capítulo anterior'}</span>{madridToday() < CHAPTER_DATES[index] && <Countdown date={CHAPTER_DATES[index]} />}</span>}
                    {done && <span className="completed-label">RECUERDO COMPLETADO</span>}
                  </motion.button>
                })}
              </div>
            </section>
            <footer className="home-footer"><span>HECHO CON AMOR, {MY_NAME.toUpperCase()}</span><span>♥</span></footer>
          </motion.div> : <motion.section className="chapter-view" key={`chapter-${selectedChapter}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <button className="back-button" onClick={() => setSelectedChapter(null)}><span>←</span> Todos los capítulos</button>
            <div className="chapter-title-block"><span className="eyebrow">CAPÍTULO 0{selectedChapter + 1} <i>✦</i> {chapterDateLabel(CHAPTER_DATES[selectedChapter]).toUpperCase()}</span><h1>{current?.title}</h1><p>{current?.intro}</p></div>
            <div className="challenge-surface"><ChapterContent index={selectedChapter} onComplete={() => markComplete(selectedChapter)} /></div>
            <button className="chapter-return" onClick={() => setSelectedChapter(null)}>← Volver al calendario</button>
          </motion.section>}
        </AnimatePresence>
        <AnimatePresence>{notice && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}<button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></motion.div>}</AnimatePresence>
      </main>
    </div>
  )
}

export default App