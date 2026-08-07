# PIA - Portal de Integridad Activa

Proyecto de integración de la plataforma de transparencia e integridad activa del Gobierno de Guatemala.

---

## 🚀 Despliegue en Firebase Hosting

Este proyecto cuenta con soporte integrado para **Firebase Hosting** con reglas de caché optimizadas para contenido estático y flujos de trabajo de **CI/CD** automatizados con GitHub Actions.

### 📋 Archivos de Configuración
- `firebase.json`: Define el directorio público, reglas de URLs limpias (`cleanUrls`), lista de archivos a ignorar y cabeceras de caché HTTP optimizadas (`Cache-Control`).
- `.firebaserc`: Asigna el alias por defecto del proyecto (`pia-portal-integridad`).
- `.github/workflows/firebase-hosting-merge.yml`: Flujo de integración continua que despliega automáticamente a producción al realizar un push o merge a la rama principal (`main` / `master`).
- `.github/workflows/firebase-hosting-pull-request.yml`: Flujo de integración continua que genera vistas previas temporales en canales de Firebase Hosting para cada Pull Request.

---

## 🛠️ Despliegue Manual con Firebase CLI

Si deseas realizar un despliegue manual desde la línea de comandos:

1. **Instalar Firebase CLI** (si no lo tienes instalado):
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**:
   ```bash
   firebase login
   ```

3. **Desplegar a Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🔐 Configuración de CI/CD en GitHub

Para activar los despliegues automáticos desde GitHub Actions:

1. Genera una clave de cuenta de servicio de Firebase ejecutando:
   ```bash
   firebase init hosting:github
   ```
2. O descarga la clave JSON desde la consola de Firebase (`Configuración del proyecto > Cuentas de servicio`).
3. Agrega el secreto `FIREBASE_SERVICE_ACCOUNT_PIA_PORTAL_INTEGRIDAD` en la sección de **Settings > Secrets and variables > Actions** de tu repositorio de GitHub.

