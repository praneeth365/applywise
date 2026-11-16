const fs = require('fs');
const cp = require('child_process');

console.log('Writing package.json...');
const pkg = {
  name: "applywise",
  version: "1.0.0",
  private: true,
  scripts: {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  dependencies: {
    "lucide-react": "^1.16.0",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  devDependencies: {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38",
    "tailwindcss": "3.4.4",
    "typescript": "5.5.4"
  }
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

console.log('Writing tsconfig.json...');
const tsconfig = {
  compilerOptions: {
    target: "es5",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [{ name: "next" }],
    paths: { "@/*": ["./*"] }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
};
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

console.log('Writing tailwind.config.js...');
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        }
      }
    },
  },
  plugins: [],
};
`;
fs.writeFileSync('tailwind.config.js', tailwindConfig);

console.log('Writing postcss.config.js...');
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
fs.writeFileSync('postcss.config.js', postcssConfig);

console.log('Writing app/globals.css...');
if (!fs.existsSync('app')) fs.mkdirSync('app');
const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 antialiased;
  }
}
`;
fs.writeFileSync('app/globals.css', globalsCss);

console.log('Setup helper finished successfully.');
