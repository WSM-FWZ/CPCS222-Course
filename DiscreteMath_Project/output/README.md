# Chapter 1 Preview — Output Layers

The Chapter 1 lesson pack is split into four narrow JSON files. Each file is
self-describing (top-level `layer` field) and shares the same join keys so a
client can rejoin any subset on demand.

## Files

| File                                | Layer              | Contains per lesson                                                  |
| ----------------------------------- | ------------------ | -------------------------------------------------------------------- |
| `chapter1_core_content.json`        | `core_content`     | `objective`, `why`, `story`, `explain`, `key_points`                 |
| `chapter1_visual_layer.json`        | `visual_layer`     | `visual` ( `type`, `idea`, `interactive_hint` )                      |
| `chapter1_assessment_layer.json`    | `assessment_layer` | `examples`, `quiz`                                                   |
| `chapter1_math_layer.json`          | `math_layer`       | `math` (formula list)                                                |
| `chapter1_preview_full.json`        | (monolithic)       | All fields combined — kept for archival / debugging only             |
| `chapter1_preview.json`             | (deprecated)       | Pointer file; clients should not consume this                        |

## Join keys (present in every layer)

- `lesson_id` — e.g. `ch1.s1.4`
- `section`   — e.g. `1.4`
- `title`     — full lesson title

## Why split?

The monolithic file is 73 KB. Splitting reduces the per-request payload
substantially when a client only needs one layer:

| Layer                       | bytes  | % of full |
| --------------------------- | -----: | --------: |
| core_content                | 34,762 |    47.5 % |
| assessment_layer            | 31,560 |    43.1 % |
| visual_layer                |  6,745 |     9.2 % |
| math_layer                  |  4,181 |     5.7 % |

A renderer that draws only the visual scaffolding loads ~9 % of the original;
a quiz UI loads ~43 %. Total token savings vary by use case but typically fall
in the **40–60 % range** for any single page render.

## Rejoining

```python
import json

base = "C:/Documentos/DiscreteMath_Project/output"
core   = json.load(open(f"{base}/chapter1_core_content.json"))
visual = json.load(open(f"{base}/chapter1_visual_layer.json"))
assess = json.load(open(f"{base}/chapter1_assessment_layer.json"))
mathl  = json.load(open(f"{base}/chapter1_math_layer.json"))

# Index by lesson_id
def by_id(layer): return {L["lesson_id"]: L for L in layer["lessons"]}

c, v, a, m = by_id(core), by_id(visual), by_id(assess), by_id(mathl)
merged = [{**c[k], **v[k], **a[k], **m[k]} for k in c]
```
