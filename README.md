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
$ docker-compose up -d
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
En construcción...

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

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
