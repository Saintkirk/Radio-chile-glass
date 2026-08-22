# Fuentes oficiales de FM Latina

La página oficial consultada es https://www.radiofmlatina.com/.

El sitio publica el logo cuadrado oficial en https://www.radiofmlatina.com/wp-content/uploads/2020/06/LogoLatina1024x1024.png.

El HTML del reproductor oficial referencia el endpoint de audio https://jm8n.com/proxy/radiofmlatina/stream. En la comprobación realizada respondió con HTTP 200, `content-type: audio/mpeg` y bytes iniciales de audio MP3.

La aplicación utiliza estas referencias para FM Latina y conserva el fallback visual de iniciales si el logo remoto no carga.
