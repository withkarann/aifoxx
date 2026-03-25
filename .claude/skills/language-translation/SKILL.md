---
name: language-translation
description: i18n and localization assistant for AIFoxx. Use when adding new translation keys, translating strings, wiring useTranslation into components, adding a new language, or debugging i18n issues.
---

# AIFoxx Language & Translation (i18n)

AIFoxx uses **react-i18next** for internationalization. The goal is to serve the UI in 7 languages.

## Supported Languages
| Code | Language     | Status    |
|------|--------------|-----------|
| `en` | English      | Source    |
| `de` | German       | Active    |
| `ru` | Russian      | Active    |
| `fr` | French       | Active    |
| `es` | Spanish      | Active    |
| `zh` | Chinese (Simplified) | Active |
| `hi` | Hindi        | Active    |

## File Structure
```
src/
  i18n/
    index.ts              ← i18next init (imports all locales, sets up detection)
    locales/
      en.json             ← English (source of truth — always update this first)
      de.json
      ru.json
      fr.json
      es.json
      zh.json
      hi.json
```

## How to Use in Components
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('nav.submitTool')}</p>;
}
```

## Translation Key Namespace Structure
Keys follow dot-notation namespacing:
```
nav.*          NavBar strings
home.*         HomePage strings
category.*     CategoryPage strings
submit.*       SubmitPage strings
tool.*         ToolDetailPage strings
filter.*       FilterBar / pricing filter strings
common.*       Shared strings (PREV, NEXT, ALL, RESET, etc.)
```

## Adding a New Translation Key
1. Add the key + English value to `src/i18n/locales/en.json` first
2. Add the translated value to all other locale files (de, ru, fr, es, zh, hi)
3. Use `t('key.name')` in the component

## Adding a New Language
1. Create `src/i18n/locales/{code}.json` with all keys from `en.json` translated
2. Add the language to the `resources` object in `src/i18n/index.ts`
3. Add the language option to the `<LanguageSwitcher>` component in NavBar

## i18n Config (`src/i18n/index.ts`)
```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import de from './locales/de.json';
// ... other imports

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, de: { translation: de }, ... },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });
```

## Language Switcher (in NavBar)
- Uses shadcn/ui `<Select>` component
- Calls `i18n.changeLanguage(code)` on change
- Shows flag emoji + language name
- Persists to localStorage via LanguageDetector

## Common Debugging
- **Strings not updating**: Component must call `useTranslation()` — hardcoded strings won't react
- **Missing key shows key name**: Add the key to all locale files, especially `en.json`
- **Language not persisting**: Check that `localStorage` is enabled and LanguageDetector config has `caches: ['localStorage']`
- **Interpolation**: Use `t('key', { count: 5 })` and `{{count}}` in JSON values

## Translation Style Guide
- Keep the retro terminal aesthetic in English (`ALL_CAPS`, `// comments`, `> prompts`)
- Other languages: translate the *meaning*, not the format — use natural language for non-English
- Chinese (zh): Use Simplified Chinese (mainland standard)
- Hindi (hi): Use Devanagari script
- Keep code-related terms (e.g. "API", "JSON", "URL") untranslated
