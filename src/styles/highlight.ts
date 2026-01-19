export const highlightStyles = {
    /* light paper, dark text */
    'Carbon Fiber': {
        soft: '#b9d7e2',
        standard: '#cfc4ab',
        accent: '#bcc189',
    },

    /* light paper, blue text */
    'Daydream Tide': {
        soft: '#f9e239',
        standard: '#c2f7ff',
        accent: '#ffd3f0',
    },

    /* dark paper, light yellow text */
    'Velvet Aubergine': {
        soft: '#3d173a',
        standard: '#2f1039',
        accent: '#180c48',
    },

    /* dark paper, muted green text */
    'Juniper': {
        soft: '#4b5603',
        standard: '#314608',
        accent: '#02350b',
    },

    /* light paper, vivid orange text */
    'Tangerine Peel': {
        soft: '#ffbb32',
        standard: '#ffe646',
        accent: '#F7FFE2',
    },

    /* light paper, wine red text */
    'Red Wine': {
        soft: '#f7becd',
        standard: '#ff99b3',
        accent: '#eb88af',
    },

    /* light paper, scarlet text */
    'Sakura Mochi': {
        soft: '#ffc5d9',
        standard: '#ffaac5',
        accent: '#d0e080',
    },

    /* salmon paper, very light pink text */
    'Smoked Salmon': {
        soft: '#a82f1f',
        standard: '#ff3c15',
        accent: '#001f6e',
    },

    /* dark brown paper, warm light text */
    'Classic Cocoa': {
        soft: '#601901',
        standard: '#ff6600',
        accent: '#ff9900',
    },

    /* dark blue paper, almost-white text */
    'Blue Sovereign': {
        soft: '#000f36',
        standard: '#145ad1',
        accent: '#026ea4',
    },

    /* light paper, strong red text */
    'Vanilla Berry': {
        soft: '#ecc488',
        standard: '#ffb74d',
        accent: '#94ccf7',
    },

    /* very light violet paper, dark violet text */
    'Lavender Haze': {
        soft: '#f3c0fe',
        standard: '#C7B3FF',
        accent: '#9A7DFF',
    },
} as const;

export type ThemeName = keyof typeof highlightStyles;
