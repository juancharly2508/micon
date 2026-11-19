# MiCon: base de datos, APK e instalación en Android 16

## 1. Crear la base de datos

El SQL completo está en [`backend/database/INSTALAR_MICON.sql`](backend/database/INSTALAR_MICON.sql). Está preparado para una instalación limpia de MariaDB y crea el esquema `miconnn` junto con sus tablas, relaciones e índices. No contiene datos ficticios ni elimina bases existentes. La primera cuenta de administrador se crea desde la app de Administración.

### Ejecutarlo en HeidiSQL

1. Instala y abre MariaDB; inicia el servicio.
2. Abre HeidiSQL y conéctate al servidor local con un usuario que pueda crear bases de datos.
3. Abre `E:\micon\backend\database\INSTALAR_MICON.sql` desde **Archivo > Cargar archivo SQL**.
4. Ejecuta el script completo con el botón de ejecutar.
5. Confirma que aparezca la base `miconnn` y sus tablas.

También puedes abrir el archivo en el cliente de MariaDB y ejecutarlo con:

```powershell
mariadb -u root -p -e "source E:/micon/backend/database/INSTALAR_MICON.sql"
```

**No ejecutes este archivo sobre una base MiCon que ya tenga datos.** Para actualizar una instalación anterior se debe respaldar primero y aplicar la migración documentada en [`backend/database/migrations/002_multi_condominio.sql`](backend/database/migrations/002_multi_condominio.sql). Esa migración se ejecuta una sola vez y detiene el proceso si encuentra más de un administrador legado.

## 2. Conectar y arrancar el backend

1. Instala Node.js 22.13 o posterior y verifica en PowerShell:

   ```powershell
   node --version
   npm --version
   ```

2. Copia `backend/.env.example` como `backend/.env` y edita las credenciales de MariaDB. Cambia `JWT_SECRET` por una cadena aleatoria larga y privada. No compartas ni subas el archivo `.env`.

   Puedes generar una con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` y pegar el resultado en `JWT_SECRET`.
3. En PowerShell:

   ```powershell
   Set-Location E:\micon\backend
   npm ci
   npm start
   ```

4. Comprueba en el navegador del equipo que ejecuta el backend: `http://localhost:3000/health`. Debe responder `{"status":"ok"}`.
5. Para probar desde un teléfono conectado a la misma Wi-Fi, permite el puerto 3000 en el firewall de Windows y usa la IPv4 local del equipo (por ejemplo, `192.168.1.50`). No uses `localhost` en el teléfono: allí se refiere al propio teléfono.

## 3. Probar cada app antes de crear APK

Las tres apps son proyectos Expo separados. En cada terminal, configura la URL del backend copiando el ejemplo y sustituyendo la IP:

```powershell
Copy-Item .env.example .env
```

Edita `.env` y deja, por ejemplo, `EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api`. Después, prueba cada app:

```powershell
Set-Location E:\micon\admin-app
npm ci
npx expo start
```

```powershell
Set-Location E:\micon\user-app
npm ci
npx expo start
```

```powershell
Set-Location E:\micon\guard-app
npm ci
npx expo start
```

Escanea el QR de Expo Go para la prueba de desarrollo. Para usar la cámara del guardia y probar los módulos nativos, crea un development build de Android además de la APK de prueba descrita a continuación.

## 4. Crear una APK instalable de cada app

Cada proyecto ya incluye `eas.json` con un perfil `preview` que genera APK para distribución interna. Expo SDK 54 (Residente) y SDK 57 (Administración y Guardia) configuran Android 16 / API 36; el SDK de residentes no es el mismo que el de las otras dos apps, así que conviene hacer una compilación de prueba de cada proyecto antes de iniciar pruebas funcionales. La documentación de Expo confirma API 36 para ambos SDK.

1. Crea o inicia sesión en una cuenta Expo y configura EAS CLI:

   ```powershell
   npm install --global eas-cli
   eas login
   ```

2. Configura cada proyecto una vez. Repite para administración, residentes y guardia:

   ```powershell
   Set-Location E:\micon\admin-app
   eas build:configure
   ```

   `eas build:configure` puede añadir un `projectId` en la configuración. Conserva el `eas.json` con el perfil `preview` de este repositorio.

3. En la consola de Expo, agrega `EXPO_PUBLIC_API_URL` al entorno `preview` con la dirección pública o de pruebas de tu API, terminada en `/api`. Una URL de `localhost` o una IP privada solo sirve cuando el teléfono puede alcanzar esa computadora en la misma red.
4. Genera la APK:

   ```powershell
   eas build --platform android --profile preview
   ```

5. Repite los pasos de configuración y compilación dentro de `user-app` y `guard-app`. Descarga el enlace que EAS entrega para cada APK. Los paquetes actuales son distintos, por lo que las tres apps pueden instalarse simultáneamente.
6. Antes de liberar las apps, despliega el backend en una dirección HTTPS estable y configura esa URL como variable EAS `EXPO_PUBLIC_API_URL`; no uses la IP de tu computadora para usuarios fuera de tu Wi-Fi.

## 5. Instalar en un teléfono Android 16

### Desde el enlace de EAS

1. Abre el enlace de descarga de la APK en el teléfono y descarga el archivo.
2. Toca la APK desde **Descargas** o el administrador de archivos.
3. Si Android lo solicita, autoriza temporalmente **Instalar apps desconocidas** para el navegador o administrador de archivos que abrió el paquete.
4. Regresa al instalador y toca **Instalar**. Repite para cada app.

   Si el teléfono muestra el permiso, la ruta suele ser **Ajustes > Aplicaciones > Acceso especial de apps > Instalar apps desconocidas** y luego habilitar el navegador o administrador de archivos usado para abrir la APK.

### Por USB con ADB

1. Activa **Opciones para desarrolladores** tocando siete veces **Número de compilación** en la información del teléfono.
2. Activa **Depuración por USB**, conecta el teléfono a la computadora y acepta el aviso de confianza.
3. Instala Android SDK Platform-Tools y ejecuta:

   ```powershell
   adb devices
   adb install -r .\MiCon-Administracion.apk
   adb install -r .\MiCon-Residentes.apk
   adb install -r .\MiCon-Guardia.apk
   ```

Usa en esos comandos los nombres reales de los archivos descargados. ADB es el camino más directo para instalar APKs de desarrollo en un teléfono Android 16.

Al 27 de octubre de 2026, el nuevo requisito de verificación de desarrolladores de Android empieza por tiendas participantes en algunos países; Android indica que la instalación directa por sideload todavía no entra en ese primer despliegue y que las instalaciones por ADB siguen funcionando. El despliegue global está previsto para 2027. Si Android presenta un aviso de verificación al instalar, usa ADB para las pruebas o sigue el flujo que muestre el dispositivo.

## 6. Primera configuración funcional

1. Asegúrate de que MariaDB y el backend estén encendidos y que `/health` responda `ok`.
2. Abre **MiCon Administración**, crea el administrador y completa el asistente: viviendas, amenidades, reglamento y si el condominio tiene guardias.
3. Abre **MiCon Residentes**, registra al residente y comparte su código con el administrador para que lo vincule a una vivienda.
4. Si el condominio tiene guardias, crea la cuenta desde Administración e inicia sesión en **MiCon Guardia**.
5. Prueba avisos, reservas, deudas, QR y conexión de red. La APK no contiene la base de datos ni el servidor: necesitan seguir en ejecución y ser accesibles desde los teléfonos.

## 7. Manual de identidad y tema

Los tres iconos usan el logotipo del manual, en azul para residentes, violeta para administración y verde para guardia. Cada app también muestra su marca en la pantalla de inicio. El control **Modo oscuro / Modo claro** está en el Perfil del residente, Configuración del administrador y barra de navegación de guardia; la selección se conserva en el dispositivo.

