# Instalacion y paso a paso de modelos de base de datos

> Proyecto documentado: **Arrenda360**.

## Pagina web del docente

Guia de referencia: <https://tecnogua.com/academic/site/bd/introduccion/>

## Verificacion inicial en WSL

Se verifican Docker, Docker Compose, la red compartida y la estructura de carpetas antes de iniciar los motores.

``` bash
sudo systemctl is-active docker
docker compose version
docker --version
docker network inspect ia-lab-network >/dev/null 2>&1 || docker network create ia-lab-network
cd ~/ia-lab && tree
```

## Configuracion general

Los cuatro servicios se ejecutan con Docker Compose, utilizan almacenamiento persistente y publican sus puertos para las conexiones desde DBeaver.

| Motor              | Contenedor        | Puerto | Base de datos / servicio |
|--------------------|-------------------|--------|--------------------------|
| MySQL 8.0          | `mysql-server`    | `3306` | `Arrenda360`             |
| PostgreSQL 17      | `postgres-server` | `5432` | `Arrenda360`             |
| MS SQL Server 2022 | `mssql-server`    | `1433` | `Arrenda360`             |
| Oracle XE 21       | `oracle-server`   | `1521` | `Arrenda360`             |

## 1. MySQL

Se configura `docker-compose.yml`, `.env` y `README.md` en `~/ia-lab/services/motores-bd/mysql`. En la evidencia del archivo `.env` se observa `MYSQL_DATABASE=Arrenda360` y `MYSQL_ROOT_PASSWORD=1231`; se habilita el puerto `3306`.

``` bash
cd ~/ia-lab/services/motores-bd/mysql
sudo docker compose config
sudo docker compose up -d
sudo docker ps --filter "name=mysql-server"
sudo docker logs mysql-server --tail 20
```

La base `Arrenda360` corresponde al proyecto documentado. En la evidencia de MySQL se crea el usuario remoto `betto_admin`, se le conceden permisos sobre la base y se verifica la conexión desde DBeaver.

``` text
Host: 172.0.0.1
Port: 3306
Database: Arrenda360
Username: betto_admin
```

El respaldo se guarda en la carpeta compartida `/mnt/d/academia/bd/`.

## 2. PostgreSQL

Se configura `docker-compose.yml`, `.env` y `README.md` en `~/ia-lab/services/motores-bd/postgres`. El servicio utiliza `POSTGRES_DB=Arrenda360` y escucha en todas las interfaces.

``` bash
cd ~/ia-lab/services/motores-bd/postgres
sudo docker compose config
sudo docker compose up -d
sudo docker ps --filter "name=postgres-server"
sudo docker exec postgres-server pg_isready -U postgres -d Arrenda360
```

Se crean las tablas del modelo, se configura el usuario de trabajo y se comprueba el acceso remoto desde DBeaver.

``` text
Host: 172.0.0.1
Port: 5432
Database: Arrenda360
Username: betto_admin
```

El respaldo se genera con `pg_dump` dentro del contenedor y se verifica en `/mnt/d/academia/bd/`.

## 3. MS SQL Server

Se configura `docker-compose.yml`, `.env` y `README.md` en `~/ia-lab/services/motores-bd/mssql`. El contenedor utiliza la edición `Developer` y el usuario administrador `SA`.

``` bash
cd ~/ia-lab/services/motores-bd/mssql
sudo docker compose config
sudo docker compose up -d
sudo docker ps --filter "name=mssql-server"
sudo docker logs mssql-server --tail 20
sudo docker exec mssql-server /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -C -Q "SELECT 1;"
```

Se crea la base `Arrenda360`, se ejecutan las tablas mediante un archivo `.sql`, y se crea el login remoto `betto_admin`.

``` text
Host: 172.0.0.1
Port: 1433
Database: Arrenda360
Username: betto_admin
```

El respaldo se genera como `backup_Arrenda360.bak` dentro de `/backups`.

## 4. Oracle XE

Se configura `docker-compose.yml`, `.env` y `README.md` en `~/ia-lab/services/motores-bd/oracle`. `Arrenda360` corresponde al PDB y al Service Name.

``` bash
cd ~/ia-lab/services/motores-bd/oracle
sudo docker compose config
sudo docker compose up -d
sudo docker ps --filter "name=oracle-server"
sudo docker logs oracle-server --tail 30
```

Durante el primer inicio se corrigen los permisos de los datos persistentes si es necesario:

``` bash
sudo docker compose down
sudo chown -R 54321:54321 ~/ia-lab/data/oracle
sudo chmod -R 775 ~/ia-lab/data/oracle
sudo docker compose up -d
```

Se crea el usuario de trabajo, se construyen las tablas del proyecto y se comprueba la conexión remota mediante DBeaver.

``` text
Host: 172.0.0.1
Port: 1521
Service Name: Arrenda360
Username: betto_admin
Role: Normal
```

El respaldo se realiza con Oracle Data Pump y se genera `backup_Arrenda360.dmp`.

## Evidencias visuales

Las capturas se presentan en el orden en que fueron tomadas durante la instalación y comprobación de los servicios.

### Verificacion y configuracion inicial

#### Evidencia 1. Verificacion inicial de Docker

![Evidencia 1](Imagenes/Captura%20de%20pantalla%202026-08-26%20111031.png)

Se ejecutan `systemctl is-active docker`, `docker compose version` y `docker --version`. La terminal muestra que Docker esta activo y que Docker Compose y Docker responden correctamente. Esta captura demuestra que el entorno WSL esta listo para trabajar con contenedores.

#### Evidencia 2. Creacion de carpetas del proyecto

![Evidencia 2](Imagenes/Captura%20de%20pantalla%202026-08-26%20111213.png)

Se crea la estructura `ia-lab/services/motores-bd` y `ia-lab/data`, con carpetas independientes para los motores. El comando `tree` permite comprobar visualmente que los directorios de servicios y datos persistentes quedaron organizados.

#### Evidencia 3. Creacion de la red Docker

![Evidencia 3](Imagenes/Captura%20de%20pantalla%202026-08-26%20111542.png)

Se ejecuta la creacion o inspeccion de `ia-lab-network` y luego se lista la red con `docker network ls`. Se observa una red de tipo `bridge`, que sera compartida por los cuatro contenedores.

#### Evidencia 4. Configuracion de MySQL

![Evidencia 4](Imagenes/Captura%20de%20pantalla%202026-08-26%20111622.png)

Se prepara el archivo `docker-compose.yml` de MySQL con la imagen `mysql:8.0`, el contenedor `mysql-server`, el puerto `3306`, el volumen de datos y la red compartida. La captura registra la configuracion inicial del primer motor.

#### Evidencia 5. Primer intento de configurar UFW

![Evidencia 5](Imagenes/Captura%20de%20pantalla%202026-08-26%20111822.png)

Se intenta permitir el puerto `3306/tcp` con UFW. La terminal informa que el comando no existe, por lo que se identifica que el firewall todavia no esta instalado en WSL.

#### Evidencia 6. Instalacion de UFW

![Evidencia 6](Imagenes/Captura%20de%20pantalla%202026-08-26%20112056.png)

Se corrige la situacion actualizando los paquetes e instalando `ufw`. La salida confirma la instalacion del firewall, necesario para permitir los puertos de los servicios de bases de datos.

#### Evidencia 7. Puerto de MySQL permitido

![Evidencia 7](Imagenes/Captura%20de%20pantalla%202026-08-26%20112342.png)

Se ejecutan `sudo ufw allow 3306/tcp`, `sudo ufw enable` y `sudo ufw status`. La captura muestra que UFW quedo activo y que el puerto de MySQL esta permitido para conexiones.

#### Evidencia 8. Variables de MySQL

![Evidencia 8](Imagenes/Captura%20de%20pantalla%202026-08-26%20112836.png)

Se crea o consulta el archivo `.env` de MySQL. En el se definen la zona horaria, la clave de `root` y la base `Arrenda360`, datos que Compose utiliza al inicializar el contenedor.

### MySQL y PostgreSQL

#### Evidencia 9. README y parametros de MySQL

![Evidencia 9](Imagenes/Captura%20de%20pantalla%202026-08-26%20113115.png)

Se documentan en `README.md` el puerto `3306`, el usuario `root`, la base `Arrenda360` y el comando de conexion local. Esta evidencia demuestra que la configuracion del servicio quedo registrada.

#### Evidencia 10. MySQL levantado

![Evidencia 10](Imagenes/Captura%20de%20pantalla%202026-08-26%20113548.png)

Se ejecutan `docker compose up -d`, `docker ps` y `docker logs`. La terminal permite verificar el estado del contenedor `mysql-server` y revisar los mensajes de inicio del servidor.

#### Evidencia 11. Tablas de Arrenda360 en MySQL

![Evidencia 11](Imagenes/Captura%20de%20pantalla%202026-08-26%20121830.png)

Se ingresa a MySQL, se selecciona `Arrenda360` con `USE Arrenda360` y se ejecuta `SHOW TABLES`. La lista confirma que las tablas principales del proyecto fueron creadas.

#### Evidencia 12. Usuario remoto de MySQL

![Evidencia 12](Imagenes/Captura%20de%20pantalla%202026-08-26%20122826.png)

Se crea el usuario `betto_admin` y se ejecutan `GRANT ALL PRIVILEGES` y `FLUSH PRIVILEGES`. La captura demuestra que el usuario recibio permisos sobre la base `Arrenda360`.

#### Evidencia 13. Comprobacion del usuario MySQL

![Evidencia 13](Imagenes/Captura%20de%20pantalla%202026-08-26%20122958.png)

Se consultan los usuarios y el metodo de autenticacion, y se comprueban los permisos de `betto_admin`. Esta verificacion confirma que el usuario puede utilizarse para la conexion desde DBeaver.

#### Evidencia 14. Conexion de MySQL en DBeaver

![Evidencia 14](Imagenes/Captura%20de%20pantalla%202026-08-26%20123307.png)

Se configura en DBeaver el controlador MySQL con host, puerto `3306`, base `Arrenda360` y usuario `betto_admin`. La captura corresponde a la prueba de los datos de conexion.

#### Evidencia 15. Backup de MySQL

![Evidencia 15](Imagenes/Captura%20de%20pantalla%202026-08-26%20123437.png)

Se genera el respaldo de `Arrenda360` y se comprueba el archivo dentro de `/mnt/d/academia/bd/`. La evidencia demuestra que el backup quedo guardado fuera del contenedor mediante el volumen compartido.

### MS SQL Server

#### Evidencia 16. Configuracion de PostgreSQL

![Evidencia 16](Imagenes/Captura%20de%20pantalla%202026-08-26%20205303.png)

Se crea el `docker-compose.yml` de PostgreSQL con la imagen `postgres:17`, el puerto `5432`, el volumen persistente y la red `ia-lab-network`. Se deja preparado el segundo motor.

#### Evidencia 17. Variables de PostgreSQL

![Evidencia 17](Imagenes/Captura%20de%20pantalla%202026-08-26%20210330.png)

Se consulta el `.env` de PostgreSQL y se verifican `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB=Arrenda360`. Estos valores definen el usuario inicial y la base que se crea al primer arranque.

#### Evidencia 18. README de PostgreSQL

![Evidencia 18](Imagenes/Captura%20de%20pantalla%202026-08-26%20211114.png)

Se registra en `README.md` el puerto `5432`, el usuario `postgres`, la base `Arrenda360` y el comando `psql`. La captura demuestra que el procedimiento de conexion local quedo documentado.

#### Evidencia 19. Error de configuracion de PostgreSQL

![Evidencia 19](Imagenes/Captura%20de%20pantalla%202026-08-26%20211957.png)

Al levantar PostgreSQL aparece un error de YAML relacionado con la clave `networks`. Esta captura registra el problema encontrado antes de corregir la indentacion y validar nuevamente Compose.

#### Evidencia 20. PostgreSQL funcionando

![Evidencia 20](Imagenes/Captura%20de%20pantalla%202026-08-26%20213400.png)

Despues de corregir el YAML, se ejecutan `docker compose up -d`, `docker ps` y `docker logs`. El contenedor `postgres-server` aparece activo y los registros confirman el inicio del servidor.

#### Evidencia 21. Tablas de Arrenda360 en PostgreSQL

![Evidencia 21](Imagenes/Captura%20de%20pantalla%202026-08-26%20213709.png)

Se ingresa con `psql`, se conecta la base `Arrenda360` y se crean las tablas del modelo. La captura sirve como evidencia de la ejecucion del esquema del proyecto.

#### Evidencia 22. Usuario de PostgreSQL

![Evidencia 22](Imagenes/Captura%20de%20pantalla%202026-08-26%20213952.png)

Se crea el usuario de trabajo y se consultan los roles con `\du`. La salida permite comprobar que el usuario existe y que fue configurado para administrar el proyecto.

#### Evidencia 23. Conexion de PostgreSQL en DBeaver

![Evidencia 23](Imagenes/Captura%20de%20pantalla%202026-08-26%20214219.png)

Se prueba la conexion usando el puerto `5432`, la base `Arrenda360` y el usuario de trabajo. La evidencia muestra la configuracion utilizada para el acceso remoto.

### Oracle XE

#### Evidencia 24. Backup y comprobacion de PostgreSQL

![Evidencia 24](Imagenes/Captura%20de%20pantalla%202026-08-26%20214454.png)

Se ejecuta `pg_dump` para generar el respaldo de `Arrenda360` y se verifica el archivo en la carpeta compartida. Con esto se completa la evidencia del trabajo realizado en PostgreSQL.

#### Evidencia 25. Configuracion de MS SQL Server

![Evidencia 25](Imagenes/Captura%20de%20pantalla%202026-08-26%20214656.png)

Se prepara el servicio `mssql-server` con la imagen de SQL Server 2022, el puerto `1433`, los volumenes persistentes y el healthcheck con `sqlcmd`. Esta es la configuracion inicial del tercer motor.

#### Evidencia 26. Variables de MS SQL Server

![Evidencia 26](Imagenes/Captura%20de%20pantalla%202026-08-26%20223059.png)

Se revisa el archivo `.env` de SQL Server con `ACCEPT_EULA=Y`, `MSSQL_PID=Developer` y la contraseña de `SA`. La captura confirma los parametros requeridos para iniciar la imagen.

#### Evidencia 27. SQL Server iniciado

![Evidencia 27](Imagenes/Captura%20de%20pantalla%202026-08-26%20223422.png)

Se levanta `mssql-server` y se revisan sus registros. El contenedor queda activo y se comprueba que SQL Server pueda responder mediante `sqlcmd`.

#### Evidencia 28. Instalacion de mssql-tools18

![Evidencia 28](Imagenes/Captura%20de%20pantalla%202026-08-26%20223935.png)

Se instala `mssql-tools18` junto con `unixodbc-dev`, se agrega `/opt/mssql-tools18/bin` al `PATH` y se ejecuta `which sqlcmd`. El resultado confirma que la herramienta quedo disponible en WSL.

#### Evidencia 29. Creacion de tablas en SQL Server

![Evidencia 29](Imagenes/Captura%20de%20pantalla%202026-08-26%20224528.png)

Se crea la base `Arrenda360`, se ejecuta el archivo SQL del proyecto y se consultan las tablas con `SELECT name FROM sys.tables`. La evidencia confirma la creacion del esquema en SQL Server.

#### Evidencia 30. Usuario remoto de SQL Server

![Evidencia 30](Imagenes/Captura%20de%20pantalla%202026-08-26%20224654.png)

Se crea o habilita el login de trabajo y se le asignan permisos para administrar la base. La captura documenta la configuracion del usuario que se utilizara en DBeaver.

#### Evidencia 31. Configuracion y conexion de Oracle XE

![Evidencia 31](Imagenes/Captura%20de%20pantalla%202026-08-26%20231805.png)

Se configura y levanta `oracle-server` con el puerto `1521`, el PDB `Arrenda360` y el usuario `SYSTEM`. Los registros permiten comprobar el avance de la inicializacion del ultimo motor.

#### Evidencia 32. Oracle XE funcionando

![Evidencia 32](Imagenes/Captura%20de%20pantalla%202026-08-26%20231814.png)

Se revisan los registros finales de Oracle y se verifica que el contenedor quede `healthy`, que el listener escuche en el puerto `1521` y que el PDB se abra en modo lectura y escritura. Esta captura demuestra que Oracle XE quedo disponible para conectarse desde DBeaver.

## Conclusiones

### Instalacion y configuracion

Durante el desarrollo de este trabajo se instalaron y configuraron cuatro motores de bases de datos: MySQL 8.0, PostgreSQL 17, MS SQL Server 2022 y Oracle XE 21. Cada motor se ejecuto dentro de un contenedor Docker independiente, con su propio archivo `docker-compose.yml`, archivo `.env`, volumen de datos y configuracion de red.

La red Docker `ia-lab-network` permitio organizar los servicios dentro del mismo entorno y mantener una configuracion centralizada. Ademas, los volumenes persistentes permitieron conservar la informacion aunque los contenedores fueran detenidos o reiniciados.

### Base de datos del proyecto

En los cuatro motores se trabajo con la base de datos o servicio `Arrenda360`, correspondiente al proyecto documentado. Se crearon las entidades principales del modelo de la aplicacion.

Aunque cada motor utiliza una sintaxis diferente, se conservaron las relaciones principales entre las tablas mediante claves primarias y claves foraneas. Esto permitio comprobar que el mismo modelo puede implementarse en diferentes sistemas gestores de bases de datos.

### Conexiones remotas

Se habilitaron los puertos `3306`, `5432`, `1433` y `1521` para permitir la comunicacion con los respectivos servicios. Las conexiones se probaron desde DBeaver utilizando la direccion IP `172.0.0.1`, la cual se conserva tal como fue registrada durante la actividad.

Para cada motor se creo o configuro un usuario de trabajo. En MySQL, la evidencia muestra especificamente el usuario `betto_admin`; en Oracle se utilizo el concepto de PDB y Service Name, mientras que en los demas motores se utilizaron sus respectivos mecanismos de usuarios, roles y permisos.

### Problemas encontrados y soluciones

Durante el proceso se presentaron varios inconvenientes que fueron solucionados mediante verificaciones y ajustes de la configuracion. Se corrigieron errores de indentacion y claves duplicadas en archivos YAML, se instalo UFW cuando el comando no estaba disponible, se ajustaron los permisos de la carpeta de datos de Oracle y se corrigieron los comandos de backup cuando la redireccion desde WSL genero errores de permisos.

Tambien se identifico que las contrasenas y los metodos de autenticacion dependen de cada motor. En SQL Server fue necesario utilizar una contrasena que cumpliera la politica de complejidad para `SA`, mientras que en Oracle se diferenciaron correctamente el usuario administrador, el esquema de trabajo y el nombre del PDB.

### Respaldos y evidencias

Se realizaron respaldos de la base `Arrenda360` utilizando las herramientas propias de cada motor: `mysqldump` para MySQL, `pg_dump` para PostgreSQL, `BACKUP DATABASE` para SQL Server y Oracle Data Pump para Oracle XE. Los archivos se almacenaron en la carpeta compartida de backups para facilitar su acceso desde WSL y Windows.

Las 32 capturas incluidas en este documento registran las etapas de instalacion, configuracion, solucion de errores, creacion de tablas, configuracion de usuarios, conexiones desde DBeaver y generacion de respaldos. De esta manera, el informe funciona como evidencia del procedimiento realizado y no solamente como una lista de comandos.

### Cierre

Como resultado final, los cuatro motores quedaron instalados y disponibles mediante Docker, con sus puertos publicados, datos persistentes y configuraciones documentadas. El trabajo permitio practicar la administracion de diferentes plataformas de bases de datos, comparar sus herramientas y preparar un entorno de desarrollo completo para Arrenda360.
