import fs from 'node:fs';
import path from 'node:path';
import { TagCategory } from '../../web/js/data.js';

const cssPath = path.join(process.cwd(), 'web/css/autocomplete-plus.css');
const css = fs.readFileSync(cssPath, 'utf8');

const semanticColors = [
    'general',
    'artist',
    'copyright',
    'character',
    'meta',
    'species',
    'lore',
    'unknown',
    'disabled',
];

const booruCategories = new Set([
    ...TagCategory.danbooru,
    ...TagCategory.e621,
    'unknown',
]);

describe('autocomplete-plus.css theme tokens', () => {
    test('does not reference removed ComfyUI palette tokens', () => {
        expect(css).not.toMatch(/--p-[a-z]/);
        expect(css).not.toContain('--comfy-hover-bg');
        expect(css).not.toContain('--p-form-field-filled-hover-background');
    });

    test('defines every semantic category color', () => {
        for (const name of semanticColors) {
            expect(css).toMatch(new RegExp(`--autocomplete-plus-tag-color-${name}\\s*:`));
        }
    });

    test('every referenced category color has a definition', () => {
        const defined = new Set(
            [...css.matchAll(/--autocomplete-plus-tag-color-([a-z]+)\s*:/g)].map(match => match[1])
        );
        const referenced = new Set(
            [...css.matchAll(/var\(--autocomplete-plus-tag-color-([a-z]+)\)/g)].map(match => match[1])
        );

        for (const name of referenced) {
            expect(defined.has(name)).toBe(true);
        }
    });

    test('covers every tag category exposed by data.js', () => {
        for (const category of booruCategories) {
            expect(css).toContain(`[data-tag-category="${category}"]`);
        }
    });

    test('colors are no longer scoped by tag source', () => {
        expect(css).not.toMatch(/\.(danbooru|e621)\s*\[data-tag-category/);
        expect(css).not.toMatch(/#(?:autocomplete-plus|related-tags)-root\s+\.(danbooru|e621)/);
    });

    test('uses theme-aware row and interaction backgrounds', () => {
        expect(css).toContain('--autocomplete-plus-list-color-even: var(--tr-even-bg-color');
        expect(css).toContain('--autocomplete-plus-list-color-odd: var(--tr-odd-bg-color');
        expect(css).toContain(
            '--autocomplete-plus-list-color-selected: var(--interface-panel-selected-surface'
        );
        expect(css).toContain(
            '--autocomplete-plus-list-color-hover: var(--interface-panel-hover-surface'
        );
    });

    test('ships light-dark pairs with a light-theme fallback for older frontends', () => {
        expect(css).toContain('@supports (color: light-dark(#000, #fff))');
        expect(css).toContain('light-dark(#005ac3, #8caaff)');
        expect(css).toContain('body.dark-theme');
        expect(css).toContain('--autocomplete-plus-tag-color-general: #8caaff');
    });
});
