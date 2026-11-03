import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CHAPTERS, PLACES } from './config'

const travelFiles = import.meta.glob('./content/viajes/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}

function placeImage(photo: string) {
  const match = Object.entries(travelFiles).find(([path]) => {
    const filename = path.split('/').pop() ?? ''
    return normalized(filename.replace(/\.(jpg|jpeg|png|webp)$/i, '')) === normalized(photo)
  })
  return match?.[1]
}

function FitMapBounds() {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds(PLACES.map((place) => [place.lat, place.lng]))
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 4 })
  }, [map])
  return null
}

function PlacesMap() {
  const [enlargedPhoto, setEnlargedPhoto] = useState<{ src: string; place: string } | null>(null)
  const heartIcon = L.divIcon({ className: 'heart-pin', html: '<span>♥</span>', iconSize: [30, 30], iconAnchor: [15, 15] })
  return (
    <>
      <section className="map-reveal">
        <span className="eyebrow">NUESTRO MAPA</span>
        <h3>{CHAPTERS[3].mapTitle}</h3>
        <div className="map-frame">
          <MapContainer center={[35, -15]} zoom={2} scrollWheelZoom={false} className="leaflet-map">
            <FitMapBounds />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {PLACES.map((place) => {
              const image = placeImage(place.photo)
              return <Marker key={place.photo} position={[place.lat, place.lng]} icon={heartIcon}>
                <Popup>
                  <div className="map-popup">
                    {image ? <button className="map-popup-image" onClick={() => setEnlargedPhoto({ src: image, place: place.name })} aria-label={`Ampliar foto de ${place.name}`}><img src={image} alt={`Recuerdo en ${place.name}`} loading="lazy" /><span>Ampliar foto ↗</span></button> : <div className="popup-placeholder">♥</div>}
                    <strong>{place.name}</strong>
                  </div>
                </Popup>
              </Marker>
            })}
          </MapContainer>
        </div>
        <p className="map-caption">{PLACES.length} lugares, y un montón de historias entre nosotros.</p>
        <div className="completion-note"><span className="completion-heart">♥</span><p>Ya tenemos el mundo lleno de recuerdos.</p><small>Vuelve mañana para el siguiente capítulo</small></div>
      </section>
      <AnimatePresence>{enlargedPhoto && <motion.div className="lightbox map-photo-lightbox" role="dialog" aria-modal="true" aria-label={`Foto ampliada de ${enlargedPhoto.place}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEnlargedPhoto(null)}><button className="lightbox-close" aria-label="Cerrar foto" onClick={() => setEnlargedPhoto(null)}>×</button><img src={enlargedPhoto.src} alt={`Recuerdo en ${enlargedPhoto.place}`} /><p>{enlargedPhoto.place}</p></motion.div>}</AnimatePresence>
    </>
  )
}

export default PlacesMap