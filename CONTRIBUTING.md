# Guía de contribución — VetCare Manager

Esta guía resume cómo el equipo trabaja con Git y GitHub en este proyecto.

## 1. Configuración inicial

```bash
git clone https://github.com/JeaneliR/VETCARE.git
cd VETCARE
git checkout develop
git pull
```

Cada integrante instala las dependencias por separado:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Convención de ramas

Toda rama nueva sale de `develop` y usa uno de estos prefijos:

- `feature/<nombre>`: una funcionalidad nueva (por ejemplo `feature/docker-despliegue`).
- `fix/<nombre>`: una corrección de un bug.
- `docs/<nombre>`: cambios de documentación que no tocan código.
- `test/<nombre>`: pruebas automatizadas.

## 3. Convención de commits

Se usa el formato de *conventional commits*:

```
<tipo>(<alcance>): <resumen en minúsculas, sin punto final>
```

Tipos usados en este proyecto: `feat`, `fix`, `test`, `docs`, `ci`, `refactor`. Por ejemplo:

```
feat(citas): agregar filtro de citas por sede
test(backend): agregar suite de pruebas unitarias y correrla en CI
```

## 4. Flujo de Pull Request

1. Crear la rama desde `develop` actualizado.
2. Desarrollar y commitear los cambios siguiendo la convención anterior.
3. Subir la rama (`git push origin <rama>`) y abrir un Pull Request hacia `develop`.
4. Esperar la revisión de al menos un integrante del equipo antes de fusionar.
5. Si la tarjeta de Jira correspondiente existe, incluir su código (por ejemplo `VET-12`) en el título del PR o en algún commit de la rama, para que quede enlazada automáticamente (ver `docs/JIRA_INTEGRATION.md`).

## 5. Mantener una rama al día con `develop`

Si `develop` avanzó mientras se trabajaba en una rama:

```bash
git checkout feature/mi-rama
git fetch origin
git rebase origin/develop
```

## 6. Resolución de conflictos

Si `git rebase` o un merge marca un conflicto:

1. Abrir los archivos marcados con `<<<<<<<`, `=======`, `>>>>>>>` y decidir qué contenido queda.
2. `git add <archivo>` por cada archivo resuelto.
3. `git rebase --continue` (o `git commit` si era un merge normal).

El repositorio documenta un conflicto real resuelto de esta forma en el commit `9073979` (fusión de las ramas `docs/actualizar-persona3-a` y `docs/actualizar-persona3-b`, que editaron el mismo párrafo de este README).

## 7. Reparto de trabajo del equipo

El equipo son tres integrantes: Jeaneli Caso Valenzuela, Angelo Navarro Pacheco y Joseph Pajuelo. El reparto de los últimos bloques del proyecto fue:

- Joseph Pajuelo: pruebas unitarias del backend e integración a CI.
- Angelo Navarro Pacheco: contenedores Docker y despliegue continuo a Render.
- Jeaneli Caso Valenzuela: documentación de contribución, integración con Jira y coordinación general del repositorio.
