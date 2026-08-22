# Fuente remota del catálogo

Se selecciona **Radio Browser** como fuente pública de estaciones. Su sitio declara que es un esfuerzo comunitario, ofrece una API abierta para aplicaciones y publica los datos acumulados bajo dominio público [1].

El endpoint usado será:

`https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=100`

La respuesta entrega objetos con `stationuuid`, `name`, `url_resolved`, `homepage`, `favicon`, `country`, `state`, `tags`, `codec`, `bitrate` y marcas de comprobación como `lastcheckok`. La app usará únicamente estaciones chilenas con `lastcheckok === 1` y una URL de stream HTTP(S) válida. Se descartarán duplicados por URL normalizada y se limitará el resultado a emisoras con nombre no vacío.

La app mantendrá FM Latina como entrada editorial fija, aunque no aparezca en la respuesta remota, y fusionará el catálogo remoto con el catálogo editorial local. El resultado se guardará en AsyncStorage con timestamp, permitiendo cargar el último catálogo conocido sin conexión.

## Referencias

[1]: https://www.radio-browser.info/ Radio Browser — servicio comunitario, API abierta y licencia de datos.
[2]: https://de1.api.radio-browser.info/json/stations/bycountryexact/Chile?hidebroken=true&limit=10 Radio Browser API — ejemplo de respuesta de estaciones de Chile.
