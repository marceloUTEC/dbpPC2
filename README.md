# AUlaSoporte

Frontend con React, TypeScript, React Router, Axios y Tailwind para consultar espacios del campus y administrar solicitudes propias.

## Ejecutar

```powershell
cd C:\Users\user\Desktop\VSCodeDBP
npm.cmd ci --cache "C:\Users\user\AppData\Roaming\Code\User\globalStorage\julialang.contexto-local\d3a53d089e99b1eda42b6e4e\package-cache\npm"
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd run dev
```

La copia de `.env.example` se necesita si aún no tienes `.env`. Conserva tu configuración si ya existe. La variable es `VITE_API_URL=https://aulasoporte-api.aaron-navarro.workers.dev/api`; esa dirección también se utiliza por defecto.

```powershell
npm.cmd run typecheck
npm.cmd run build
```

En Windows se usa `npm.cmd` para ejecutar los comandos aunque PowerShell tenga deshabilitados los scripts `.ps1`, sin cambiar la configuración del sistema.

## Archivos y recuperación

Al revisar el proyecto, todos los archivos versionados del último commit local estaban presentes y Git no mostraba eliminaciones. Ya había cambios pendientes en `src/pages/LocationDetail.tsx` y `src/pages/MyTickets.tsx`, además de dos documentos sin versionar: `README.md` y `README-AUTORIA.md`; se conservaron. No es posible determinar desde el repositorio qué se envió a la Papelera ni asegurar que se recuperaron archivos que nunca estuvieron guardados en Git.

`src/useQuery.ts` ya existía al iniciar esta revisión. Es un hook propio de React que comparte la carga, los errores, el reintento y la cancelación de consultas entre las páginas; no es una dependencia adicional.

Para comprobar eliminaciones futuras:

```powershell
git status --short
git ls-files --deleted
git log --oneline -5
```

Si se elimina un archivo versionado, puedes recuperar su última versión guardada sustituyendo la ruta del ejemplo. Este comando reemplaza el contenido de ese archivo; úsalo sólo para el archivo que quieras recuperar.

```powershell
git restore --source=HEAD -- src/pages/Dashboard.tsx
```

Los archivos que nunca se guardaron en un commit requieren recuperarse desde la Papelera o una copia de seguridad. No se revisó ni modificó la Papelera en esta actualización.

## Subir tus cambios

El repositorio local ya está inicializado en `main` y `origin` apunta a `https://github.com/marceloUTEC/dbpPC2.git`. No necesitas repetir `git init` ni `git remote add origin`.

Ejecuta personalmente estos comandos cuando hayas revisado los cambios:

```powershell
cd C:\Users\user\Desktop\VSCodeDBP
git status --short
git diff
git add .
git commit -m "mensaje"
git push -u origin main
```

No se ejecutaron commits ni push en esta actualización. GitHub puede solicitar tu autenticación. Si rechaza el envío porque hay cambios remotos, revisa primero `git fetch origin` y `git log --oneline --all --graph`; no fuerces el push.

## Solicitudes

`/my-tickets` consulta únicamente las solicitudes del usuario autenticado. El cierre se ofrece para solicitudes `OPEN`, pide confirmación y comprueba que la solicitud siga en la lista propia antes de consumir `PATCH /tickets/:id/close`. La actualización de la vista es una consulta independiente a `GET /me/tickets` después de cerrar. Ante un conflicto HTTP 409 o `INVALID_STATE`, informa que el registro cambió y solicita otra vez la lista para mostrar su estado actual.

El detalle permite enviar una descripción de 10 a 200 caracteres tras recortar espacios. Después del envío vuelve a consultar el espacio. Si la API responde HTTP 409 o `LOCATION_CLOSED`, informa que el espacio está cerrado y no admite solicitudes, conserva la descripción y vuelve a consultar el detalle. El aviso permanece visible durante la actualización, incluso si esta falla; la consulta permite reintentar.

Las rutas de espacios, detalle y solicitudes requieren una sesión. Las peticiones protegidas incluyen el JWT como Bearer; un HTTP 401 de la sesión actual elimina la sesión y devuelve al login, incluso si el token ya no está guardado. Una respuesta atrasada de una sesión anterior no cierra una sesión nueva. También se puede cerrar sesión desde la navegación. Si cambia la cuenta en otra pestaña, se descartan las consultas anteriores y se cargan los datos del nuevo usuario.

Los endpoints y las estructuras de datos del cliente corresponden al contrato publicado en https://aulasoporte-api.aaron-navarro.workers.dev/openapi.json. La compilación y la comprobación de tipos no ejecutan pruebas automatizadas ni envían solicitudes de negocio a la API.
