# IntelliHub Color Palette

All values sourced from `src/app/globals.css`. CSS variables use HSL; hex equivalents are listed for design tool use.

---

## Brand Gradient

```
linear-gradient(135deg, #4F46E5 → #7C3AED)
```

Used on primary CTAs (`.grad-brand`) and headline text (`.text-grad-brand`).

---

## Light Mode

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--background` | 210 40% 98% | `#F8FAFC` | Page background |
| `--foreground` | 222 47% 11% | `#0F1729` | Body text |
| `--card` | 0 0% 100% | `#FFFFFF` | Card surfaces |
| `--card-foreground` | 222 47% 11% | `#0F1729` | Text on cards |
| `--popover` | 0 0% 100% | `#FFFFFF` | Popover background |
| `--popover-foreground` | 222 47% 11% | `#0F1729` | Text in popovers |
| `--primary` | 244 76% 59% | `#4F46E5` | Indigo — buttons, links, focus ring |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | Text on primary |
| `--secondary` | 262 83% 58% | `#7C3AED` | Violet — gradient endpoint, accents |
| `--secondary-foreground` | 0 0% 100% | `#FFFFFF` | Text on secondary |
| `--muted` | 210 40% 96% | `#F1F5F9` | Subtle backgrounds, hover states |
| `--muted-foreground` | 215 16% 47% | `#64748B` | Secondary / placeholder text |
| `--accent` | 244 76% 96% | `#EEEDFD` | Light indigo tint |
| `--accent-foreground` | 244 76% 40% | `#2319B4` | Text on accent backgrounds |
| `--destructive` | 0 72% 51% | `#DC2828` | Errors, destructive actions |
| `--destructive-foreground` | 0 0% 100% | `#FFFFFF` | Text on destructive |
| `--border` | 214 32% 91% | `#E1E7EF` | Dividers, input borders |
| `--input` | 214 32% 91% | `#E1E7EF` | Input border |
| `--ring` | 244 76% 59% | `#4F46E5` | Focus ring |
| `--sidebar` | 249 46% 12% | `#13112E` | Deep indigo navy sidebar |
| `--sidebar-foreground` | 0 0% 100% | `#FFFFFF` | Text on sidebar |

---

## Dark Mode

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--background` | 248 39% 8% | `#0F0C1C` | Page background |
| `--foreground` | 210 40% 96% | `#F1F5F9` | Body text |
| `--card` | 249 33% 12% | `#181529` | Card surfaces |
| `--card-foreground` | 210 40% 96% | `#F1F5F9` | Text on cards |
| `--popover` | 249 33% 12% | `#181529` | Popover background |
| `--popover-foreground` | 210 40% 96% | `#F1F5F9` | Text in popovers |
| `--primary` | 244 76% 64% | `#675DE9` | Lighter indigo |
| `--primary-foreground` | 0 0% 100% | `#FFFFFF` | Text on primary |
| `--secondary` | 262 83% 64% | `#8F57EF` | Lighter violet |
| `--secondary-foreground` | 0 0% 100% | `#FFFFFF` | Text on secondary |
| `--muted` | 249 25% 18% | `#201A42` | Subtle backgrounds |
| `--muted-foreground` | 217 18% 65% | `#96A2B6` | Secondary / placeholder text |
| `--accent` | 249 30% 20% | `#231C4A` | Accent backgrounds |
| `--accent-foreground` | 210 40% 96% | `#F1F5F9` | Text on accent |
| `--destructive` | 0 63% 50% | `#D02F2F` | Errors, destructive actions |
| `--destructive-foreground` | 0 0% 100% | `#FFFFFF` | Text on destructive |
| `--border` | 249 25% 20% | `#262046` | Dividers, input borders |
| `--input` | 249 25% 22% | `#2A2249` | Input border |
| `--ring` | 244 76% 64% | `#675DE9` | Focus ring |
| `--sidebar` | 250 45% 9% | `#100D21` | Deep navy sidebar |
| `--sidebar-foreground` | 0 0% 100% | `#FFFFFF` | Text on sidebar |

---

## Radius

| Token | Value |
|---|---|
| `--radius` | `0.75rem` (12px) |

Applied to cards, buttons, inputs, and dropdowns.
