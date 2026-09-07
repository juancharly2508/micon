# Base de datos MiCon

El esquema completo está en `miconnn.sql`. Se creó a partir del archivo SQL proporcionado y no contiene cuentas ni datos de ejemplo.

Con MariaDB/MySQL instalado, impórtalo una sola vez desde la raíz del proyecto:

```powershell
mysql -u root -p < backend/database/miconnn.sql
```

El script crea la base `miconnn` si no existe. No se debe ejecutar de nuevo sobre una base ya inicializada porque las restricciones con clave foránea ya existirían.
