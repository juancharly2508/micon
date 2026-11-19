# Base de datos MiCon

El SQL completo de instalación limpia está en `INSTALAR_MICON.sql`. En HeidiSQL, cárgalo y ejecútalo una sola vez. Desde PowerShell también se puede importar desde la raíz del proyecto:

```powershell
mariadb -u root -p -e "source E:/micon/backend/database/INSTALAR_MICON.sql"
```

Para una base ya inicializada con el esquema anterior, primero respalda la base y aplica **una sola vez** `migrations/002_multi_condominio.sql`. La migración conserva los datos anteriores dentro del condominio del único administrador existente. Si hay varios administradores, se detiene para evitar asignarles datos mezclados; en ese caso se requiere asignación manual antes de migrar. Si aún no hay administradores, los registros antiguos quedan sin asignar y deben revisarse manualmente.

El administrador completa el asistente después de registrarse. Cada residente crea su cuenta y comparte su código con el administrador para que éste lo vincule a una vivienda.
