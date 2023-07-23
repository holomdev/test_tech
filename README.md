# Prueba técnica 🚀

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="100" alt="Nest Logo" /></a>
</p>

## Descripción 🔥

Esta es una aplicación Backend desarrollada en Node.js utilizando TypeScript y el framework [Nest](https://github.com/nestjs/nest)💚. La aplicación cuenta con pruebas unitarias y de integración, migraciones y seeders. Además, ofrece soporte para rutas públicas y rutas protegidas mediante el uso de JWT. También incluye documentación de la API generada con Swagger.

## Dependencias 

- Docker 4+
- Postgres 13+
- Nodejs 16+
- Typescript 5+

## Instalación

Antes de pasar a esta sección, asegúrate de tener instalado el software de dependencias.

### Clonar el repositorio

```bash
$ git clone git@github.com:holomdev/test_tech.git
```

### Configurar la base de datos

El proyecto contiene un archivo llamado `docker-compose.yml`, este contiene la información para crear la base de datos para desarrollo y para pruebas e2e.
Solo es necesario correr el siguiente comando en el directorio donde clonaste la aplicación.
Por defecto la base de datos para desarrollo usa el puerto `5432` y la base de datos para pruebas e2e usa el puerto `5433`

<p align="center">
  <a href="https://www.docker.com/" target="blank"><img src="https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png.webp" width="100" alt="Docker Logo" /></a>
</p>

```bash
$ docker-compose up -d db-tech
```

### Configurar las variables de entorno

A continuación, procederemos a configurar las variables de entorno del proyecto, para esto hay un archivo llamado `.env.example` en la raíz del proyecto.
Debemos hacer una copia de este archivo y renombrarla a `.env`. Después procederemos a poner la configuración correcta según las nuestras necesidades

```bash
DATABASE_USER=postgres
DATABASE_PASSWORD=pass123
DATABASE_NAME=postgres
DATABASE_PORT=5432
DATABASE_HOST=localhost

JWT_SECRET=YOUR_SECRET_KEY_HERE
JWT_TOKEN_AUDIENCE=localhost:3000
JWT_TOKEN_ISSUER=localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
```

### Instalar paquetes de la aplicación

Una vez configurada la aplicación nos disponemos a instalar los paquetes necesarios

```bash
$ npm install
```

### Ejecutando las migraciones

#### Crear migraciones
Para poder crear migraciones solo basta el siguiente comando. Esto generara un archivo dentro del directorio `src/migrations`.
```bash
$  npx typeorm migration:create src/migrations/NombreMigracion
```

#### Correr migraciones existentes
Para poder correr las migraciones, antes se debe haber seteado las variables de entorno en el archivo `.env`.
Después solo basta correr los siguientes dos comandos.
```bash
$ npm run build
$ npx typeorm migration:run -d dist/typeorm-cli.config
```

#### Ejemplo de la salida

```bash
λ npx typeorm migration:run -d dist/typeorm-cli.config
query: SELECT * FROM current_schema()
query: SELECT version();
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'migrations'
query: CREATE TABLE "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
0 migrations are already loaded in the database.
3 migrations were found in the source code.
3 migrations are new migrations must be executed.
query: START TRANSACTION
query: CREATE TABLE "user"
      (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "username" character varying NOT NULL,
...
```

### Ejecutando los seeders
En construcción...

## Cómo ejecutar la aplicación

### En modo desarrollo
Nestjs ofrece dos versiones de desarrollo, pero la que comúnmente se usa es la de `"watch mode"`, ya que permite ver los cambios en vivo, si necesidad de detener y ejecutar de nuevo el servidor

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

### En modo produccion
En este modo te permite correr la aplicación desde un build de producción.

```bash
# production mode
$ npm run start:prod
```

### Crear build de produccion
Este comando nos permite solamente el build de producción en la carpeta dist para luego ser ejecutado por otro tipo de software como [PM2](https://pm2.keymetrics.io/)
```bash
# production mode
$ npm run build
```

## Documentación del api

Para poder visualizar la documentación en la UI de swagger, solo es necesario correr la aplicación en modo desarrollador `npm run start:dev` para poder tener la siguiente url `http://localhost:3000/api`

<p align="center">
  <a href="https://swagger.io/" target="blank"><img src="https://static1.smartbear.co/swagger/media/images/tools/opensource/swagger_ui.png" width="400" alt="Swagger Logo" /></a>
</p>

## Test

### Test unitarios
Para correr los test unitarios solo basta el siguiente comando: 

```bash
$ npm run test

$ npm run test:watch //modo watch
```
Ejemplo de salida

```console
λ npm run test

> test_tech@0.0.1 test
> jest

 PASS  src/posts/posts.service.spec.ts (10.393 s)
 PASS  src/comments/comments.service.spec.ts (10.416 s)
 PASS  src/iam/authentication/authentication.service.spec.ts (10.485 s)
 PASS  src/posts/posts.controller.spec.ts (11.059 s)
 PASS  src/comments/comments.controller.spec.ts (11.123 s)
 PASS  src/iam/authentication/authentication.controller.spec.ts (11.164 s)

Test Suites: 6 passed, 6 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        12.379 s, estimated 14 s
Ran all test suites.
```

### Test e2e
Aunque hay varias técnicas para hacer los test e2e como puede ser mock a las funciones de la bd, o suplantar por una db tipo sqlite, en esta ocasión optamos por lanzar un base de datos en docker cada que corre un test e2e y esta misma se destruye al terminar el test para asegurar que el test es lo más real posible.

Esto se tiene automatizado en el `package.json` con los scripts `pretest` y `posttest`

> **Warning**
> Las pruebas e2e se deben correr por separado, ya que el proceso de correrlo es pesado, a continuación, se dejan los comandos para poder hacer esto.

#### App e2e

```bash
$ npm run test:e2e -- app
```

#### Authentication e2e
```bash
$ npm run test:e2e -- authentication
```

#### Posts e2e
```bash
$ npm run test:e2e -- posts
```

#### Comments e2e
```bash
$ npm run test:e2e -- comments
```

## Estructura del proyecto
En construcción...
```mermaid
stateDiagram-v2
  state "Tech test" as Tech_test {
    [*] --> Tech_test.Iam
    Tech_test.Iam --> Tech_test.signin : Login
    Tech_test.Iam --> Tech_test.signup : Register
    Tech_test.Iam --> Tech_test.AuthenticationGuard : request
    Tech_test.AuthenticationGuard --> Tech_test.AccessTokenGuard : verify JWT
    Tech_test.AuthenticationGuard --> Tech_test.Posts_CRUD : posts...
    Tech_test.AuthenticationGuard --> Tech_test.Comments_CRUD : comments...
    Tech_test.signin --> Tech_test.User : find
    Tech_test.signup --> Tech_test.User : save
    state "Iam" as Tech_test.Iam
    state "signin" as Tech_test.signin
    state "signup" as Tech_test.signup
    state "AuthenticationGuard" as Tech_test.AuthenticationGuard
    state "AccessTokenGuard" as Tech_test.AccessTokenGuard
    state "Posts CRUD" as Tech_test.Posts_CRUD
    state "Comments CRUD" as Tech_test.Comments_CRUD
    state "User" as Tech_test.User
  }
```