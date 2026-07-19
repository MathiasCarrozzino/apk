# Control de ingreso — Proyecto Capacitor (Android)

Este proyecto empaqueta la app web (`www/`) en una APK nativa de Android
usando [Capacitor](https://capacitorjs.com/).

## Qué necesitás instalar antes (una sola vez)

1. **Node.js** (versión LTS) → https://nodejs.org
2. **Android Studio** → https://developer.android.com/studio
   - Al instalarlo, dejá que baje el **Android SDK** (te lo pide en el
     primer arranque, "SDK Manager").
   - Anotá dónde queda instalado el SDK (Android Studio te lo muestra en
     *Settings → Languages & Frameworks → Android SDK*), por si después
     hace falta configurar la variable de entorno `ANDROID_HOME`.

## Pasos para generar el APK

Abrí una terminal **dentro de esta carpeta** (`capacitor-project/`) y
ejecutá, uno por uno:

```bash
# 1) Instalar las dependencias de Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2) Crear el proyecto nativo de Android (usa la config de capacitor.config.json)
npx cap add android

# 3) Copiar los archivos de www/ al proyecto nativo
npx cap sync

# 4) Abrir el proyecto en Android Studio
npx cap open android
```

El último comando abre **Android Studio**. Ahí adentro:

1. Esperá a que termine de sincronizar Gradle (barra de progreso abajo,
   puede tardar varios minutos la primera vez).
2. Menú **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Cuando termine, aparece un aviso abajo a la derecha con un link
   **"locate"** — ahí está tu `app-debug.apk`, listo para copiar al
   celular e instalar.

### Alternativa por línea de comandos (sin abrir Android Studio)

```bash
cd android

# Windows:
gradlew.bat assembleDebug

# Mac / Linux:
./gradlew assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

## Cada vez que modifiques el código (HTML/CSS/JS)

No hace falta repetir todo el proceso. Solo:

```bash
npx cap sync
```

Y volvés a compilar el APK (paso 4 de arriba, o `gradlew assembleDebug`).

## Antes de instalar en el celular

Android va a advertir que es una app de "origen desconocido" — es
normal, porque no viene de Google Play. Tenés que habilitar esa opción
en el celular la primera vez (Configuración → Seguridad → Instalar apps
desconocidas, habilitado para el navegador/administrador de archivos que
uses para abrir el APK).

## Notas importantes

- **`appId`** (en `capacitor.config.json`): está como
  `com.miempresa.controlingreso`. Podés dejarlo así para uso personal,
  pero si en algún momento pensás subir la app a Google Play, tiene que
  ser único — te conviene cambiarlo antes (ej:
  `com.tunombre.controlingreso`) porque después es más difícil de
  modificar sin perder la identidad de la app instalada.

- **Cámara para escanear:** una vez armado el proyecto Android (paso 2),
  si al probar el botón "📷 Cámara" no te pide permiso o no anda, abrí
  `android/app/src/main/AndroidManifest.xml` y confirmá que tenga esta
  línea (Capacitor normalmente ya la agrega, pero por las dudas):

  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  ```

- **Compartir/Excel:** dentro de la APK instalada, el botón "📄 Excel"
  funciona igual (descarga al almacenamiento del dispositivo). Si más
  adelante querés retomar el botón de "enviar por Gmail" que probamos
  antes, dentro de una APK real funciona **mejor** que en el navegador,
  porque no depende de HTTPS — puedo agregarlo cuando quieras.

- **Ícono y splash screen:** por ahora la app va a usar el ícono
  genérico de Android. Si querés un ícono propio, avisame y te preparo
  las imágenes en los tamaños que pide Android.
