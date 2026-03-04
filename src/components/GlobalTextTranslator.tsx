import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE, phraseTranslations, type SupportedLanguage } from '../i18n/resources';

type TranslatorProps = {
  children: ReactNode;
};

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label'] as const;

const shouldSkipElement = (element: Element) => {
  const tagName = element.tagName;
  return (
    tagName === 'SCRIPT' ||
    tagName === 'STYLE' ||
    tagName === 'NOSCRIPT' ||
    element.closest('[data-no-translate="true"]') !== null
  );
};

const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ');

const canonicalizeText = (text: string) =>
  normalizeText(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/\s+([.,!?;:])/g, '$1');

const splitOuterWhitespace = (text: string) => {
  const leading = text.match(/^\s*/)?.[0] ?? '';
  const trailing = text.match(/\s*$/)?.[0] ?? '';
  const core = text.slice(leading.length, text.length - trailing.length);
  return { leading, core, trailing };
};

export function GlobalTextTranslator({ children }: TranslatorProps) {
  const { i18n } = useTranslation();
  const textStateRef = useRef(new WeakMap<Text, { source: string; translated: string }>());

  const language = (SUPPORTED(i18n.language) ? i18n.language : DEFAULT_LANGUAGE) as SupportedLanguage;

  const dictionary = useMemo(() => {
    if (language === DEFAULT_LANGUAGE) return null;
    return phraseTranslations[language] ?? null;
  }, [language]);

  const dictionaryLookup = useMemo(() => {
    if (!dictionary) return null;
    const lookup = new Map<string, string>();

    Object.entries(dictionary).forEach(([source, translated]) => {
      lookup.set(normalizeText(source), translated);
      lookup.set(canonicalizeText(source), translated);
    });

    return lookup;
  }, [dictionary]);

  useEffect(() => {
    const textState = textStateRef.current;

    const translateString = (input: string): string => {
      if (!dictionaryLookup) return input;
      const { leading, core, trailing } = splitOuterWhitespace(input);
      const normalized = normalizeText(core);
      if (!normalized) return input;

      const direct = dictionaryLookup.get(normalized) ?? dictionaryLookup.get(canonicalizeText(core));
      if (direct) return `${leading}${direct}${trailing}`;

      const terminalPunctuation = core.match(/[.!?…]+$/)?.[0] ?? '';
      if (terminalPunctuation) {
        const withoutPunctuation = core.slice(0, -terminalPunctuation.length);
        const punctuated =
          dictionaryLookup.get(normalizeText(withoutPunctuation)) ??
          dictionaryLookup.get(canonicalizeText(withoutPunctuation));

        if (punctuated) {
          return `${leading}${punctuated}${terminalPunctuation}${trailing}`;
        }
      }

      return input;
    };

    const processTextNode = (node: Text) => {
      const parentElement = node.parentElement;
      if (!parentElement || shouldSkipElement(parentElement)) return;

      const current = node.textContent ?? '';
      const record = textState.get(node);

      let source = current;
      if (record) {
        source = current !== record.translated ? current : record.source;
      }

      const translated = translateString(source);

      if (current !== translated) {
        node.textContent = translated;
      }

      textState.set(node, { source, translated });
    };

    const processAttributes = (element: Element) => {
      if (shouldSkipElement(element)) return;

      TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const originalAttributeKey = `data-original-${attribute}`;
        const current = element.getAttribute(attribute);
        if (current === null) return;

        if (!element.hasAttribute(originalAttributeKey)) {
          element.setAttribute(originalAttributeKey, current);
        }

        let source = element.getAttribute(originalAttributeKey) ?? current;
        let translated = translateString(source);

        if (current !== source && current !== translated) {
          source = current;
          element.setAttribute(originalAttributeKey, source);
          translated = translateString(source);
        }

        if (current !== translated) {
          element.setAttribute(attribute, translated);
        }
      });

      if (element instanceof HTMLInputElement) {
        const isButtonLike = ['button', 'submit', 'reset'].includes(element.type);
        if (!isButtonLike || !element.value) return;

        if (!element.dataset.originalValue) {
          element.dataset.originalValue = element.value;
        }

        const source = element.dataset.originalValue;
        const translated = translateString(source);

        if (element.value !== source && element.value !== translated) {
          element.dataset.originalValue = element.value;
        }

        const finalSource = element.dataset.originalValue;
        const finalTranslated = translateString(finalSource);
        if (element.value !== finalTranslated) {
          element.value = finalTranslated;
        }
      }
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        processTextNode(node as Text);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as Element;
      if (shouldSkipElement(element)) return;

      processAttributes(element);

      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let currentNode: Node | null = walker.currentNode;

      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          processTextNode(currentNode as Text);
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          processAttributes(currentNode as Element);
        }
        currentNode = walker.nextNode();
      }
    };

    processNode(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          const target = mutation.target;
          if (target.nodeType === Node.TEXT_NODE) {
            processTextNode(target as Text);
          }
          return;
        }

        if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          processAttributes(mutation.target as Element);
          return;
        }

        mutation.addedNodes.forEach((addedNode) => processNode(addedNode));
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES, 'value'],
    });

    return () => observer.disconnect();
  }, [dictionaryLookup]);

  return <>{children}</>;
}

function SUPPORTED(lang: string): lang is SupportedLanguage {
  return lang === 'en' || lang === 'si' || lang === 'ta';
}
