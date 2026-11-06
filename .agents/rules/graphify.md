---
trigger: always_on
description: Mantener actualizado y consultar el grafo de conocimiento Graphify en graphify-out/ para optimizar consumo de créditos.
---

## graphify

Este proyecto cuenta con un grafo de conocimiento local en `graphify-out/`.

### Reglas obligatorias:
1. **Actualización continua del grafo con cada cambio**:
   - Cada vez que se creen, modifiquen o eliminen archivos de código o configuración en la sesión, se DEBE ejecutar inmediatamente `graphify update .` para mantener el grafo sincronizado (análisis AST local sin coste de créditos/tokens).
   - Los Git hooks (`post-commit`, `post-checkout`, `post-merge`, `post-rewrite`) reconstruyen automáticamente el grafo tras cada commit.
2. **Consultas antes de leer código masivo (Ahorro de créditos)**:
   - Para cualquier consulta sobre la arquitectura o navegación del repositorio, utilizar primero `graphify query "<pregunta>"` o `graphify path "<Origen>" "<Destino>"`.
   - Si existe `graphify-out/wiki/index.md`, explorarlo antes de leer archivos en crudo.
   - Leer `graphify-out/GRAPH_REPORT.md` solo para análisis amplios de arquitectura.
