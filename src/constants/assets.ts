
export const SEALS = [
    { id: 'leaf', src: '/images/seals/seal-leaf.png', name: 'Autumn Leaf' },
    { id: 'sakura', src: '/images/seals/seal-sakura.png', name: 'Spring Sakura' },
    { id: 'blue', src: '/images/seals/seal-blue.png', name: 'Ocean Blue' },
    { id: 'heart', src: '/images/seals/seal-heart.png', name: 'Violet Heart' },
    { id: 'white', src: '/images/seals/seal-white.png', name: 'White Rosemary' },
];

export const ENVELOPES = [
    // 1–2 fixed
    {
        id: 'white',
        name: 'Warm Ivory',
        env: '#E9E4DC',
        envFront: '#F2EEE7',
        envSecond: '#D8D2C8',
        isDark: false,
    },
    {
        id: 'black',
        name: 'Charcoal Black',
        env: '#1E1E1E',
        envFront: '#2A2A2A',
        envSecond: '#141414',
        isDark: true,
    },

    // light → dark → pop → soft (rhythm start)
    {
        id: 'pink',
        name: 'Cherry Blush',
        env: '#ffb7ccff',
        envFront: '#ff94b6ff',
        envSecond: '#fea0bcff',
        isDark: false,
    },
    {
        id: 'ink_teal',
        name: 'Ink Teal',
        env: '#0F4C5C',
        envFront: '#0a5f70ff',
        envSecond: '#082F39',
        isDark: true,
    },
    {
        id: 'lemon',
        name: 'Lemon Cream',
        env: '#F6E3A1',
        envFront: '#fae68cff',
        envSecond: '#f8da70ff',
        isDark: false,
    },
    {
        id: 'grape_ash',
        name: 'Grape Ash',
        env: '#4B3A4F',
        envFront: '#4e3c53ff',
        envSecond: '#2E2431',
        isDark: true,
    },

    // cool → warm → dark earth
    {
        id: 'mint',
        name: 'Mint Candy',
        env: '#9EDDD3',
        envFront: '#9cefe3ff',
        envSecond: '#84C9BF',
        isDark: false,
    },
    {
        id: 'butter',
        name: 'Butter Milk',
        env: '#F2D7B6',
        envFront: '#f8daafff',
        envSecond: '#E4C39A',
        isDark: false,
    },
    {
        id: 'burnt_matcha',
        name: 'Burnt Matcha',
        env: '#3F4F2E',
        envFront: '#5E6F4A',
        envSecond: '#26301B',
        isDark: true,
    },

    // airy → bold pop → classic
    {
        id: 'sky',
        name: 'Baby Sky',
        env: '#AFCBE8',
        envFront: '#a8caefff',
        envSecond: '#97B6D6',
        isDark: false,
    },
    {
        id: 'electric_apricot',
        name: 'Electric Apricot',
        env: '#FF8A4D',
        envFront: '#e67437ff',
        envSecond: '#E0632A',
        isDark: false,
    },
    {
        id: 'navy',
        name: 'Classic Navy',
        env: '#1E2A38',
        envFront: '#2A394A',
        envSecond: '#141E28',
        isDark: true,
    },

    // finish with cozy & calm
    {
        id: 'lavender',
        name: 'Lavender Soda',
        env: '#C6B7E2',
        envFront: '#cdbdf3ff',
        envSecond: '#B1A0D1',
        isDark: false,
    },
    {
        id: 'matcha',
        name: 'Matcha Latte',
        env: '#A8C2A0',
        envFront: '#93b58cff',
        envSecond: '#8FAA88',
        isDark: false,
    },
    {
        id: 'cocoa',
        name: 'Classic Cocoa',
        env: '#4B1D10',
        envFront: '#62231E',
        envSecond: '#53211A',
        isDark: true,
    }
];

export const CUTE_COLOR_MAP: Record<string, string> = {
    // 🏳️ Basic
    'white': '#F4F1EA',      // Warm White
    'black': '#4A4A4A',      // Soft Charcoal

    // 🌸 Pastels
    'pink': '#FFC4D6',       // Soft Pink
    'ink_teal': '#68A6B2',   // Muted Teal
    'lemon': '#FDF0B3',      // Butter Cream
    'grape_ash': '#9B8EA9',  // Dusty Purple

    // 🌿 Nature
    'mint': '#B6E6DE',
    'butter': '#F8E4C5',
    'burnt_matcha': '#8DA37D',

    // ☁️ Airy & Pop
    'sky': '#C5DFF8',
    'electric_apricot': '#FFAD85', // Softened Apricot
    'navy': '#5B7C99',       // Muted Navy

    // 🍵 Cozy
    'lavender': '#DCD3F3',
    'matcha': '#C3DBC0',
    'cocoa': '#8D6E63'       // Milk Chocolate
};

export const STREAM_OVERLAY_MAP: Record<string, string> = {
    // 1️⃣ fixed
    'Carbon Fiber': '#6EF3FF',        // Neon Ice Blue — tech, คม, สะอาดมาก

    // 🎭 dreamy → dark
    'Daydream Tide': '#4DF0FF',       // Neon Sky — ฟ้าใสแบบฝัน แต่แรงพอขึ้นสตรีม
    'Velvet Aubergine': '#C77DFF',    // Neon Amethyst — jewel glow บนพื้นมืด สวยมาก

    // 🌿 earthy → 🍊 pop
    'Juniper': '#39FF14',             // Toxic Green — ธรรมชาติแต่ไซเบอร์ เด้งสุด
    'Tangerine Peel': '#FF6A00',      // Neon Tangerine — ส้มระเบิด พลังสูง

    // 🍷 mature → 💗 playful
    'Red Wine': '#FF2F92',            // Neon Rose — หรูแต่เร้าอารมณ์
    'Cherry Riot': '#FF2FD6',         // Hot Pink Neon — idol / pop ชัดมาก
    'Smoked Salmon': '#FF5A3D',       // Neon Coral — อุ่น สด ไม่กลืนพื้น

    // ☕ cozy → 👑 royal
    'Classic Cocoa': '#FFD84D',       // Neon Honey — อบอุ่นแต่สว่าง หรู
    'Blue Sovereign': '#00F0FF',      // Electric Cyan — ราชัน + futuristic

    // 🍓 light → 💜 soft
    'Vanilla Berry': '#FF2F4F',       // Berry Neon — หวานแต่แรง
    'Lavender Haze': '#C77DFF'        // Neon Lilac — fantasy glow นุ่มแต่ชัด
};

export const ENVELOPE_OVERLAY_MAP: Record<string, string> = {
    // 1–2 fixed
    'white': '#FFFFFF',          // Ivory Glow — ขาวเรือง สะอาด
    'black': '#2B2B2B',          // Charcoal Glow — ดำเรือง ไม่เทา

    // light → dark → pop → soft
    'pink': '#FF5FA2',           // Cherry Neon — ชมพูเดิมแต่สว่างขึ้น
    'ink_teal': '#00B7C2',       // Ink Teal Neon — teal เดิม เรืองน้ำหมึก
    'lemon': '#FFF04A',          // Lemon Neon — เหลืองครีม → lemon glow
    'grape_ash': '#9B6BFF',      // Grape Neon — ม่วงเทา → jewel violet

    // cool → warm → dark earth
    'mint': '#3FFFD9',           // Mint Neon — mint เดิม แต่ใสจัด
    'butter': '#FFD27A',         // Butter Glow — ครีมอุ่น เรืองนม
    'burnt_matcha': '#7CFF3A',   // Matcha Neon — เขียวเข้ม → เขียวเรือง

    // airy → bold pop → classic
    'sky': '#6EC9FF',            // Sky Neon — ฟ้า baby sky แต่สด
    'electric_apricot': '#FF8A2A', // Apricot Neon — ส้มเดิม เรืองหวาน
    'navy': '#3F5BFF',           // Navy Neon — น้ำเงินเข้ม เรือง royal

    // finish cozy & calm
    'lavender': '#C58BFF',       // Lavender Neon — ม่วงนุ่มเรือง
    'matcha': '#7DFF9A',         // Matcha Fresh — เขียวนม เรืองใส
    'cocoa': '#FF9A3A',          // Cocoa Glow — น้ำตาล → amber glow
};
