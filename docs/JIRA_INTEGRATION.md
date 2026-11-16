# Integración Jira ↔ GitHub

Este proyecto usa **Jira** (no GitHub Issues) para el seguimiento de incidentes e historias de usuario. El tablero del equipo está en:

https://rosmerycaso4.atlassian.net/jira/core/projects/VET/board

## 1. Instalar la app de GitHub para Jira (una sola vez)

1. En Jira: ícono de apps → **GitHub for Jira** (o entrar directo a `https://github.com/marketplace/jira-software-github-integration`).
2. Conectar la cuenta de GitHub dueña del repositorio (`JeaneliR`) y autorizar el acceso a `VETCARE`.
3. Elegir el sitio Jira `rosmerycaso4.atlassian.net` como destino.

Una vez instalada, cada push, Pull Request y commit del repositorio queda visible dentro de la tarjeta de Jira correspondiente, siempre que el commit o el título del PR mencione el código de la tarjeta (por ejemplo `VET-12`).

## 2. Convención de "smart commits"

Para enlazar un commit a una tarjeta, su mensaje debe incluir el código de la tarjeta:

```
git commit -m "feat(citas): agregar filtro por sede VET-12"
```

Jira reconoce además palabras clave después del código para mover la tarjeta automáticamente:

```
VET-12 #comment avance registrado en el commit
VET-12 #close
VET-12 #time 2h
```

## 3. Nombrar las ramas con el código de la tarjeta

Se recomienda prefijar el nombre de la rama con el código cuando exista tarjeta:

```
feature/VET-12-filtro-citas-por-sede
```

GitHub for Jira detecta el código tanto en el nombre de la rama como en los commits y en el título del Pull Request.

## 4. Carga inicial del tablero VET

Para no crear cada tarjeta a mano, Jira permite importar un CSV directamente desde el tablero (⋯ → **Importar issues desde CSV**). Se preparó `jira_issues_import.csv` (entregado junto con este documento, no versionado en el repositorio) con una tarjeta por cada requisito funcional/no funcional y por cada bloque de infraestructura del proyecto (pruebas, CI, Docker, CD, monitoreo, mantenimiento), ya marcadas como "Done" o "Pendiente" según el estado real del proyecto a la fecha. Al importarlo, Jira pide mapear las columnas del CSV a los campos del proyecto VET (Summary, Issue Type, Description, Labels, Priority, Status).

## 5. Responsable de esta integración

Jeaneli Caso Valenzuela coordina el tablero VET y la instalación de la app de GitHub for Jira; cualquier integrante del equipo puede crear o mover tarjetas una vez instalada.
