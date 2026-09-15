// Conocimiento institucional para el asistente virtual.
// Fuentes oficiales: "Directorio funcionarios" (Colegio Cafam, v1 26/01/2026)
// y "Líneas telefónicas atención a padres".
// Formato de las filas del directorio:
// CURSO | DOCENTE | CORREO | ÁREA | DÍA DE ATENCIÓN (1=lunes … 5=viernes) | UNIDAD | SALÓN

export const STAFF_DIRECTORY_SOURCE = "Directorio funcionarios (Colegio Cafam)";
export const PHONE_LINES_SOURCE = "Líneas telefónicas atención a padres";

export const STAFF_DIRECTORY_TEXT = `== COLEGIO CAFAM- DIRECTORIO FUNCIONARIOS ==

== BÁSICA PRIMARIA ==

== TRANSICIÓN ==
TR A | Caro Parra Diana Carolina | dccaro@colegio.cafam.edu.co | SOCIALES | 3 | 1 | AD101
TR B | Rodriguez Garcia Cindy Paola | cprodriguez@colegio.cafam.edu.co | CIENCIAS | 5 | 4 | AD102
TR C | Dulce Ocampo Leidy Viviana | lvdulce@colegio.cafam.edu.co | CASTELLANO | 5 | 3 | AD103
TR D | López García Merary Jackeline | mjlopez@colegio.cafam.edu.co | HUMANIDADES | 2 | 4 | AD105
TR E | Garrote Báez Lorena | lggarrote@colegio.cafam.edu.co | MATEMÁTICAS | 2 | 2 | AD106
Apoyo A | Rojas Calderón Elizabeth | erojas@colegio.cafam.edu.co | INGLÉS | 1 | 4
Apoyo B | Aperador Umba Leidy Jeniffer | ljaperador@colegio.cafam.edu.co | TECNOLOGÍA | 2 | 3
Apoyo C | Peña Mora Elder Farid | efpena@colegio.cafam.edu.co | EDU. FÍSICA | 2 | 1
Apoyo D | Ruiz Garzón Hebelyn Gineth | hgruiz@colegio.cafam.edu.co | SUPERNUMERARIA
Apoyo E | Lozano Bedoya Diana Marcela | dimlozano@colegio.cafam.edu.co | NATACIÓN | 3 | 1

== PRIMERO ==
1A | Supelano Sosa Katherine Adriana | kasupelano@colegio.cafam.edu.co | MATEMÁTICAS | 5 | 5 | AD107
1B | Vargas Burgos Johanna Marcela | jmvargas@colegio.cafam.edu.co | HUMANIDADES | 4 | 2 | AA101
1C | Olaechea Rojas Nasly Katherine | nkolaechea@colegio.cafam.edu.co | SOCIALES | 2 | 1 | AA102
1D | Velásquez Garcia Diana Carolina | dcvelasquez@colegio.cafam.edu.co | CASTELLANO | 4 | 2 | AA103
1E | Delgadillo Pérez Diego Mauricio | dmdelgadillo@colegio.cafam.edu.co | CIENCIAS | 2 | 1 | AA104
1F | Ardila Jiménez Ángela Viviana | avardila@colegio.cafam.edu.co | SOCIALES | 5 | 1 | AA105
Apoyo A | Loaiza Hernandez Maria José | miloaiza@colegio.cafam.edu.co | INGLÉS | 3 | 3
Apoyo B | Peña Mora Elder Farid | efpena@colegio.cafam.edu.co | EDU. FÍSICA | 2 | 1
Apoyo C | Mendoza Susa Jhonn Freddy | jfmendoza@colegio.cafam.edu.co | ARTES | 1 | 2
Apoyo D | Orjuela Soche Pablo César | porjuela@colegio.cafam.edu.co | INGLÉS | 1 | 4
Apoyo E | Lucero Ángela Rocio | arlucera@colegio.cafam.edu.co | INGLÉS | 3 | 1
Apoyo F | Aperador Umba Leidy Jeniffer | ljaperador@colegio.cafam.edu.co | TECNOLOGÍA | 2 | 3

== SEGUNDO ==
2A | Martinez Hernandez Jenny Vanessa | ivmartinez@colegio.cafam.edu.co | HUMANIDADES | 2 | 2 | AA106
2B | Mosquera Forero Johanna Marcela | jmmosquera@colegio.cafam.edu.co | SOCIALES | 4 | 1 | AA107
2C | Lozano Cano Linda Rocio | lrlozano@colegio.cafam.edu.co | CIENCIAS | 1 | 1 | AA108
2D | Cortés Ramirez Karen Jullieth | ktcortes@colegio.cafam.edu.co | SOCIALES | 4 | 4 | AA109
2E | Naranjo Morales Marlodys | mnaranjo@colegio.cafam.edu.co | CASTELLANO | 4 | 1 | AA110
2F | Silva Martin Yenni Alexandra | yasilva@colegio.cafam.edu.co | MATEMÁTICAS | 2 | 5 | AA111
2G | López Mojica Lisbeth | lllopez@colegio.cafam.edu.co | MATEMÁTICAS | 3 | 4 | AA112
Apoyo 2G | Olivero Anchique Nicolas Alejandro | naoliveros@colegio.cafam.edu.co | ARTES | 2 | 1 | AD108
Apoyo 2B | López Quintero Ana Milena | alopez@colegio.cafam.edu.co | EDU. FÍSICA | 2 | 1
Apoyo 2E | Márquez Ramirez Rebeca | rmmarquez@colegio.cafam.edu.co | INGLÉS | 2 | 4
Apoyo 2F | García Martinez Luz Andrea | agarcia@colegio.cafam.edu.co | INGLÉS | 4 | 4
Apoyo 2A y 2D | Alfonso Rodriguez Andrés Felipe | afalfonso@colegio.cafam.edu.co | TECNOLOGÍA | 2 | 2
Apoyo 2C | Mendieta Diaz Keila Carolina | kcmendieta@colegio.cafam.edu.co | ARTES | 2 | 1 | AD111

== TERCERO ==
3A | Castro Hernandez Harry Stiven | hcastro@colegio.cafam.edu.co | INGLÉS | 4 | 1 | AA113
3B | López Garcia Zaira Marcela | zmlopez@colegio.cafam.edu.co | MATEMÁTICAS | 3 | 2 | AA114
3C | Lache Gómez Christian Ricardo | crlache@colegio.cafam.edu.co | SOCIALES | 4 | 1 | AA115
3D | Ayala Espinosa Maria de los Ángeles | maayala@colegio.cafam.edu.co | HUMANIDADES | 5 | 1 | AB101
3E | Huertas Baquero Diana Katherine | dkhuertas@colegio.cafam.edu.co | MATEMÁTICAS | 3 | 2 | AB103
3F | Acevedo Acosta Joan Sebastian | jsacevedo@colegio.cafam.edu.co | INGLÉS | 1 | 1 | AB104
3G | Garay Hostos Xiomara | xggaray@colegio.cafam.edu.co | CASTELLANO | 5 | 1 | AB105
Apoyo 3D | Puentes Segura Nathalie Constanza | ncpuentes@colegio.cafam.edu.co | INGLÉS | 3 | 1
Apoyo 3G | Arenas Rivera Marco Antonio | marenas@colegio.cafam.edu.co | CIENCIAS NATURALES | 5 | 1
Apoyo 3C | Beltrán Pulido Lina Maria | lmbeltran@colegio.cafam.edu.co | CASTELLANO | 4 | 2
Apoyo 3B | Villamil Rodriguez Andrés Camilo | acvillamil@colegio.cafam.edu.co | ARTES | 2 | 1 | AC212
Apoyo 3E | Cote Gomez Carlos Mario | cmcote@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 1
Apoyo 3A y 3F | Martinez Martinez Heidy | hmmartinez@colegio.cafam.edu.co | SUPERNUMERARIA | 4 | 1

== CUARTO ==
4A | Agudelo Bustos Yenny Fernanda | yagudelo@colegio.cafam.edu.co | SOCIALES | 4 | 1 | AB203
4B | Alape Rodriguez Angie Lizeth | aalape@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 2 | AB106
4C | Gambasica Diaz William Alexander | wagambasica@colegio.cafam.edu.co | INGLÉS | 3 | 1 | AB107
4D | Ocampo Rodriguez Nathalia Camila | ncocampo@colegio.cafam.edu.co | EDU. FÍSICA | 2 | 1 | AC102
4E | Restrepo Guarin Jeimmy Rocio | jrestrepo@colegio.cafam.edu.co | HUMANIDADES | 1 | 5 | AC103
4F | Gallego Vargas Yeimy Marcela | ymgaego@colegio.cafam.edu.co | SOCIALES | 2 | 1 | AB205
4G | Moreno Ruiz Leidy Johana | limoreno@colegio.cafam.edu.co | CASTELLANO | 4 | 1 | AB204
Apoyo 4C y 4D | Vargas Orbegozo Laura Daniela | ldvargas@colegio.cafam.edu.co | VIOLÍN | 2 | 1 | AC109
Apoyo 4B y 5G | Cano Polanco Jessica Alejandra | jacano@colegio.cafam.edu.co | TEATRO | 2 | 1 | AC105
Apoyo 4F y 5A | Beltrán López Solsibeles Yabelin | sblopez@colegio.cafam.edu.co | SUPERNUMERARIA
Apoyo 4G | Gutiérrez Diaz Cristhian Camilo | CCGUTIERREZ@colegio.cafam.edu.co | INGLÉS | 1 | 2
Apoyo 4A | Quintero Gacharná Laura Catalina | lcquintero@colegio.cafam.edu.co | CIENCIAS NATURALES | 4 | 1
Apoyo 4E | León Rozo Jenny Patricia | jpleon@colegio.cafam.edu.co | CASTELLANO | 3 | 3
5A | Muñoz Fonseca Andrea Viviana | avmunoz@colegio.cafam.edu.co | CIENCIAS NATURALES | 4 | 1 | AC203
5B | Cárdenas Florez Diana Marcela | dmcardenas@colegio.cafam.edu.co | MATEMÁTICAS | 3 | 1 | AC204
5C | Sierra Lozano Mónica Yined | msierra@colegio.cafam.edu.co | CASTELLANO | 2 | 2 | AC210
5D | Quiroga Méndez Johan Arley | jquiroga@colegio.cafam.edu.co | EDU. FÍSICA | 2 | 1 | AC211
5E | Páez Jaramillo José Fernando | jfpaez@colegio.cafam.edu.co | INGLÉS | 1 | 1 | AB102
5F | Gutiérrez Builes Juan Fernando | jfgutierrez@colegio.cafam.edu.co | HUMANIDADES | 4 | 5 | AB201
5G | Velasco Bohórquez Ana María | amvelasco@colegio.cafam.edu.co | CASTELLANO | 2 | 1 | AB202
5H | Vergara Alfonso Diana Carolina | dcvergara@colegio.cafam.edu.co | INGLÉS | 2 | 1 | AB206
Apoyo 5D | Galindo Niño Valentina | vngalindo@colegio.cafam.edu.co | SOCIALES | 4 | 1
Apoyo 5F y 5H | Valenzuela Alvarado Andrea | avalenzuela@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 2
Apoyo 5C | Guatame Lozada Cristian Leonardo | cisuatame@colegio.cafam.edu.co | DANZAS | 2 | 1 | AC108
Apoyo 5E | Martínez Melo Nidia Stella | nsmartinez@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 2
Apoyo 5B | Durán Pinilla Franklyn Alejandro | faduran@colesio.cafam.edu.co | TECNOLOGÍA | 2 | 1
COORDINADORES PRIMARIA | DÍA DE ATENCIÓN | UNIDAD
Coordinación Ciclo TR", 1° y 2° | Mejia Tolosa Yaqueline | ymejia@colegio.cafam.edu.co | CITA PREVIA
Coordinación Ciclo 3°, 4° y 5° | López Ramirez Andrea | anlopez@colegio.cafam.edu.co | CITA PREVIA
Secretaria Primaria | Bastidas Triana Manolo | mbastidas@colegio.cafam.edu.co | Ext. 5192 | Cel: 317 403 0767

== BÁSICA Y MEDIA ==

== QUINTO ==

== SEXTO ==
6A | Murcia Mendoza Sindy Lorena | simurcia@colegio.cafam.edu.co | CASTELLANO | 3 | 1 | 111
6B | Manrique Galeano Claudia Liliana | clmanrigue@colegio.cafam.edu.co | CASTELLANO | 3 | 1 | 113
6C | Melo Ontibon Kelly Lizet | kmelo@colegio.cafam.edu.co | INGLÉS | 3 | 2 | 114
6D | Torres Naizaque Luisa Fernanda | lutorres@.colegio.cafam.edu.co | MATEMÁTICAS | 4 | 1 | 201
6E | Pérez Sarmiento Viviana Marcela | vmperez@colegio.cafam.edu.co | INGLÉS | 3 | 1 | 202
6F | Restrepo Bermudez Edgar Andrés | earestrepo@colegio.cafam.edu.co | CIENCIAS | 3 | 1 | 200
6G | Cruz Bautista Iván Dario | idcruz@colegio.cafam.edu.co | HUMANIDADES | 4 | 1 | 203
6H | Nieves Arévalo Diego Alberto | danieves@colegio.cafam.edu.co | SOCIALES | 2 | 2 | 211
Apoyo 6AB | Hernandez Vega Diego Felipe | dfhernandez@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 6CD | Puentes Rodriguez Jorge Ricardo | jrpuentes@colegio.cafam.edu.co | ED. FÍSICA | 3 | 4
Apoyo 6EH | Botache Rugeles Viviana Marcela | ymbotache@colegio.cafam.edu.co | TECNOLOGÍA | 4 | 2
Apoyo 6FG | Hoyos Arias Jaime Alberto | jaahoyos@colegio.cafam.edu.co | SOCIALES | 4 | 1
Apoyo | Rodriguez Juan Sebastián | jsrodriguez@colegio.cafam.edu.co | MATEMÁTICAS | 2 | 3

== SÉPTIMO ==
7A | Forero Barrera Sandra Milena | smforero@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 1 | 117
7B | Tovar Castellanos Edilma Marcela | mtovar@colegio.cafam.edu.co | CASTELLANO | 4 | 1 | 118
7C | Camargo Carreño Michael Steven | mscamargo@colegio.cafam.edu.co | INGLÉS | 4 | 1 | 119
7D | Cuevas Garzón Rosa Elvira | recuevas@colegio.cafam.edu.co | SOCIALES | 4 | 1 | 120
7E | Lizarazo Diaz Edwin Fabián | eflizarazo@colegio.cafam.edu.co | MATEMÁTICAS | 5 | 3 | 121
7F | Huertas Zamora Tatiana | thuertas@colegio.cafam.edu.co | INGLÉS | 4 | 1 | 116
7G | Quintero Vargas José Armando | jaquintero@colegio.cafam.edu.co | HUMANIDADES | 5 | 2 | 115A
7H | Pardo Ariza Laura Stefany | lspardo@colegio.cafam.edu.co | CIENCIAS | 4 | 1 | 115B
Apoyo 7A | Morales Ramirez Magda Shiomara | msmorales@colegio.cafam.edu.co | ED. FÍSICA | 3 | 4
Apoyo 7B | Nonsoque Guzman Ángela Rocio | arnonsoque@colegio.cafam.edu.co | ED. FÍSICA | 3 | 4
Apoyo 7C-7D | Chaparro Arboleda Luis Felipe | lfchaparro@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 7E-7F | Rodriguez Salinas Claudia Raquel | crrodriguez@colegio.cafam.edu.co | TECNOLOGÍA | 4 | 2
Apoyo 7G | Olmos Pérez Karolhay | kolmos@colegio.cafam.edu.co | CIENCIAS | 4 | 1
Apoyo 7H | Cadena Benitez Eliana Alejandra | eacadena@colegio.cafam.edu.co | CIENCIAS | 4 | 1
Apoyo | Ortiz Angel Luz Mery | lmortiz@colegio.cafam.edu.co | SUPERNUMERARIA

== OCTAVO ==
8A | Fajardo Cárdenas Katherine | rffajardo@colegio.cafam.edu.co | CIENCIAS | 1 | 2 | 204
8B | Castro Daza Lizeth | llcastro@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 1 | 205
8C | Ramirez Villareal Laura Nathalia | lnramirez@colegio.cafam.edu.co | CASTELLANO | 4 | 3 | 206
8D | Garzón Romero Mónica Marcela | mggarzon@colegio.cafam.edu.co | INGLÉS | 3 | 1 | 207
8E | Calderon Velandia Angie Paola | apcalderon@colegio.cafam.edu.co | CIENCIAS | 5 | 2 | 208
8F | Escobar Real Rocio | rescobar@colegio.cafam.edu.co | CASTELLANO | 5 | 2 | 209
8G | Muñoz Moreno Jonathan | jmunoz@colegio.cafam.edu.co | SOCIALES | 1 | 3 | 210
Apoyo 8A | Castellanos Ariza Jhon Gustavo | jcastellanos@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4
Apoyo 8B | Rodriguez Guiza Sergio Andres | omendez@colegio.cafam.edu.co | TECNOLOGÍA | 4 | 2
Apoyo 8C | Ospino Arias Beatriz Elena | SERODRIGUEZ@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 8D | Corzo Acuña Miguel Ángel | maacuna@colegio.cafam.edu.co | HUMANIDADES | 1 | 1
Apoyo 8E | Abril Duarte Maria Alejandra | _mabril@colegio.cafam.edu.co | INGLÉS | 4 | 2
Apoyo 8-F-G | Plata Escobar Edwin Tiberio | etplata@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4
NOVENO
9A | Vanegas Casallas Andrés Felipe | afvanegas@colegio.cafam.edu.co | CIENCIAS | 5 | 2 | 308
9B | Bernal Gaitán Edwar | ebernal@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 2 | 212
9C | Monroy Mariño Zully Tatiana | tmonroy@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 1 | 300
9D | Castañeda Rojas José Rodolfo | jrcastaneda@colegio.cafam.edu.co | CASTELLANO | 1 | 2 | 301
9E | Santa Dennis Lorena | dlsanta@colegio.cafam.edu.co | HUMANIDADES | 5 | 1 | 302
9F | Reyes Donoso William Ariel | wareyes@colegio.cafam.edu.co | INGLÉS | 3 | 1 | 303
9G | Ceballos Baquero Juan Manuel | jmceballos@colegio.cafam.edu.co | SOCIALES | 4 | 2 | 304
9-H | Cubides Mora Yuli Andre | yacubides@colegio.cafam.edu.co | CASTELLANO | 2 | 1 | 305
Apoyo 9-A | Cristancho Ángela María | ancristancho@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 9-B | Rodríguez Ochoa Jorge Leonardo | lrodriguez@colegio.cafam.edu.co | INGLÉS | 4 | 3
Apoyo 9-C | Ludys Vanessa Mancera García | lvmancera@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4
Apoyo 9-D | Mora Gómez Pedro Alejandro | pmora@colegio.cafam.edu.co | CIENCIAS | 3 | 1
Apoyo 9-E | Alfonso Lozano Guillermo | galfonso@colegio.cafam.edu.co | SOCIALES | 5 | 3
Apoyo 9-F-G | Hernandez Rosas Javier Arturo | jahernandez@colegio.cafam.edu.co | TECNOLOGÍA | 4 | 2
Apoyo 9-H | Galindo Cepeda Juan Andrés | jagalindo@colegio.cafam.edu.co | MATEMÁTICAS | 1 | 3
Apoyo | Rincón Nuñez Laura | lrrincon@colegio.cafam.edu.co | SUPERNUMERARIA | 4 | 1

== DÉCIMO ==
10A | Pardo Espejo Mónica Lorena | ampardo@colegio.cafam.edu.co | SOCIALES | 4 | 1 | 313
10B | Fernandez Giomar Rocio | grfernandez@colegio.cafam.edu.co | CASTELLANO | 3 | 3 | 312
10C | Mora Rojas Ronny Jair | rjmora@colegio.cafam.edu.co | MATEMÁTICAS | 2 | 2 | 311
10D | Roncancio Silva Natalia | nrroncancio@colegio.cafam.edu.co | CIENCIAS | 1 | 3 | A.C.
10E | Pita Jiménez Angie Paola | appita@colegio.cafam.edu.co | INGLÉS | 5 | 1 | 127
10F | Hurtado Cedeño Doralice | dchurtado@colegio.cafam.edu.co | CASTELLANO | 4 | 1 | 310
10G | Vargas Quintero Federico | fvargas@colegio.cafam.edu.co | HUMANIDADES | 4 | 1 | 309
Apoyo 10 A | Ramos Forero Milton Andrés | mramos@colegio.cafam.edu.co | SOCIALES | 2 | 2
Apoyo 10 B | Montenegro Triana Margot | mmmontenegro@colegio.cafam.edu.co | SUPERNUMERARIA | 2 | 2
Apoyo 10 C | Casallas Ortega Jonathan Eliecer | jecasallas@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 10 D | Parra Pérez Hernán Dario | hdparra@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4
Apoyo 10 E | Zambrano Villate Carolina | czambrano@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4
Apoyo 10 F | Sierra Olarte Julian Mauricio | JMSIERRA@colegio.cafam.edu.co | SOCIALES | 3 | 3
Apoyo 10 G | Ibarra Villamizar Diego | daibarra@colegio.cafam.edu.co | EDU. FÍSICA | 3 | 4

== UNDÉCIMO ==
11A | Agudelo Quevedo Luis Alejandro | lagudelo@colegio.cafam.edu.co | INGLÉS | 3 | 2 | 226
11B | Fajardo Ibáñez Aleyda Maria | amfajardo@colegio.cafam.edu.co | CASTELLANO | 3 | 4 | 131
11C | Cardona Gómez Diana Carolina | dccardona@colegio.cafam.edu.co | CIENCIAS | 4 | 1 | 144
11D | Vargas Rodriguez Joan Felipe | jfvargas@colegio.cafam.edu.co | CIENCIAS | 5 | 3 | 138
11E | Burgos Hernández Carlos Arturo | caburgos@colegio.cafam.edu.co | MATEMÁTICAS | 4 | 4 | 125
11F | Gutiérrez Zapata Cesar Andrés | cagutierrez@colegio.cafam.edu.co | CIENCIAS | 1 | 2 | 143
11G | Téllez Acuña Javier Ricardo | jrtelez@colegio.cafam.edu.co | CIENCIAS | 3 | 1 | 133
11H | Ferreira Cristancho Marianne | mferreira@colegio.cafam.edu.co | INGLÉS | 4 | 3 | 126
Apoyo 11A | Muñoz Mendieta Jennette Ximena | jumunoz@colegio.cafam.edu.co | SOCIALES | 5 | 1
Apoyo 11 B-F | Chacón Vega Valentina | vcchacon@colegio.cafam.edu.co | HUMANIDADES | 5 | 1
Apoyo 11C | Cárdenas López Paola | pacardenas@colegio.cafam.edu.co | FILOSOFÍA | 5 | 1
Apoyo 11 D -E | Callejas Guerrero Wilson Yair | wycallejas@colegio.cafam.edu.co | ARTES | 1 | 3
Apoyo 11G | Soto Saray Andrés Sebastián | assoto@colegio.cafam.edu.co | MATEMÁTICAS | 3 | 5
Apoyo 11H | Gil Cubillos Katerine Julieth | kgil@colegio.cafam.edu.co | TECNOLOGÍA | 4 | 2
COORDINADORES BACHILLERATO | DÍA DE ATENCIÓN
Coordinación Ciclo 6° Y 7° 8° | Hoyos Hoyos William | whoyos@colegio.cafam.edu.co | CITA PREVIA
Coordinación Ciclo 9° Y 10° 11° | Estupiñan Zabala Myriam Rosalba | mestupinan@colegio.cafam.edu.co | CITA PREVIA
DIRECTORES/ COORDINADORES ACADÉMICOS | DÍA DE ATENCIÓN
Dirección Programas Académicos y Convivenciales | Bermúdez Cubides Yimy | CITA PREVIA
Dirección Dpto. Español y Artes | Casallas Bello Alba Beatriz | acasallas@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Sociales | Acevedo Betancourt Andres Elias | aeacevedo@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Humanidades | Villamil Lopez Nubia Maria | nmvillamil@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Ed. Física | Ibañez Castillo Karen Liliana | kbanez@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Ciencias Naturales | Celis Calderon Michael Andrés | mcelis@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Matemáticas | Acero Molina Liz Pieranllely | lpacero@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Bilingüismo Bachillerato | Sandoval Gonzalez Heidi Tatiana | tsandoval@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Bilingüismo Primaria | Rincon peña Jasleidy | jrincon@colegio.cafam.edu.co | CITA PREVIA
Coordinación Académica Tecnología | Castro Rojas Carlos Arturo | carcastro@colegio.cafam.edu.co | CITA PREVIA
APOYO ACADÉMICO | ATENCIÓN
Secretaria Básica y Media | Arandia Riveros Marcela | marandia@colegio.cafam.edu.co | Ext. 5198 cel: 316 522 7318
Apoyo sistemas TIC | Martinez Rocha Juan Nicolás | jnmartinez@colegio.cafam.edu.co | CORREO ELECTRÓNICO
Gestión de Calidad | Vera Cortés Sandra Yamile | svera@colegio.cafam.edu.co | CORREO ELECTRÓNICO
RECTORÍA | ATENCIÓN
Rectoria | Molina Mantilla Adriana | CITA PREVIA
Secretaria Rectoria | Solano Beltrán Leidy Estefanía lesolano@cafam.edu.co | Ext. 5172 cel: 317 431 2973
DEPARTAMENTO DE BIENESTAR | ATENCIÓN
Dirección Bienestar Estudiantil | Arévalo Guzmán Leidy Johana ljarevalo@colegio.cafam.edu.co | CITA PREVIA
Profesional Bienestar | Florez Bautista Yessica Milena TR° y 1° ymflorez@colegio.cafam.edu.co
Profesional Bienestar | Ramírez Paz Kelly Dayana 2° y 3° kdramirez@colegio.cafam.edu.co
Profesional Bienestar | Zamora Deisy Julieth 4° y 5° dzamora@colegio.cafam.edu.co
Profesional Bienestar | Bernal Díaz Felipe Alejandro 6° y 7° fabernal@colegio.cafam.edu.co
Profesional Bienestar | Umba Angie Lorena 8° y 9° alumba@colegio.cafam.edu.co
Profesional Bienestar | Quintero Ausique Karen Paola 10° y 11° kpquintero@colegio.cafam.edu.co
Family School | Figueroa Forero Leidy Katherine lkfigueroa@colegio.cafam.edu.co
Diversity School | Verano Melo Diana Carolina dcverano@colegio.cafam.edu.co
Diversity School | Ortiz Rosas Angie Hasbleidy ahortiz@colegio.cafam.edu.co
Diversity School | Rubiano Rodas Maria Paula mprubiano@colegio.cafam.edu.co
Promoción y prevención | Artunduaga Jennyfer Catherine jcartunduaga@colegio.cafam.edu.co
CRE (Biblioteca) | Moreno Moreno Yuly Shirley ysmoreno@colegio.cafam.edu.co | EXT. 5174 / 5176
CRE (Biblioteca) | Acevedo Silva Andrés Steven asacevedo@colegio.cafam.edu.co | EXT. 5174 / 5177
CRE (Biblioteca) | González Burgos Diana Consuelo dcgonzalez@colegio.cafam.edu.co | EXT. 5174 / 5178
CRE (Biblioteca) | Vega Peña Olga Bibiana obvega@colegio.cafam.edu.co | EXT. 5174 / 5179
Enfermería | Vargas Betancourt Luz Ángela lvargas@colegio.cafam.edu.co primerosauxilios@colegio.cafam.edu.co | Primaria 3164489320
Enfermería | Fernández Yeny Constanza ycfernandez@colegio.cafam.edu.co primerosauxilios@colegio.cafam.edu.co | Bachillerato 3152594222
Enfermería | Cruz Sandoval Ruth Milena rmcruz@colegio.cafam.edu.co primerosauxilios@colegio.cafam.edu.co
Enfermería | Cárdenas Rodríguez Angie Lorena alcardenas@colegio.cafam.edu.co primerosauxilios@colegio.cafam.edu.co
DEPARTAMENTO ADMINISTRATIVO Y FINANCIERO | ATENCIÓN
CORREO NOVEDADES FINANCIERAS | novedadespension@cafam.edu.co
CORREO ADMISIONES | admisiones@colegio.cafam.edu.co | 5172- 5192
Supervisión Logística y Transporte | Quiroga Alarcon Orlando o.quiroga@colegio.cafam.edu.co | cel: 316 742 7481
Coordinación Financiera | Angulo Morantes Carolina novedadespension@cafam.edu.co | CORREO ELECTRÓNICO
Coordinación Administrativa | Morales Contreras Diana Patricia dmorales@cafam.com.co | CORREO ELECTRÓNICO
Secretaría Administrativa | Joya Castro Carlos Orlando cjoya@colegio.cafam.edu.co | EXT. 5185 318 363 9895
Portería Bachillerato | EXT. 5180
Portería Primaria | EXT. 5189

== Extracted images (16): ==

== LÍNEAS TELEFÓNICAS DE ATENCIÓN A PADRES (documento: Líneas telefónicas atención a padres) ==
Nota: estas líneas NO tienen servicio de WhatsApp.
Correo temas financieros y administrativos | novedadespension@cafam.edu.co
Rectoría | 317 431 2973
PBX | (601) 437 8999
Dirección académica primaria | 317 403 0767
Dirección académica bachillerato | 316 522 7318
Enfermería primaria | 316 448 9320
Enfermería (segunda línea) | 315 259 4222
Transporte escolar | 316 742 7481
Correo general | colegio@cafam.com.co
Direcciones | AK 68 # 64-45 (Bachillerato) · AC 64C # 68F-29 (Primaria)
`;
