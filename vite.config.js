// vite.config.js
import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';
import path from 'path';

// Функция для чтения HTML компонентов
function readHtmlComponent(componentPath) {
	return fs.readFileSync(path.resolve(__dirname, componentPath), 'utf-8');
}

// Определяем режим разработки
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
	root: 'scr', // указываем корневую директорию проекта
	build: {
		outDir: '../dist', // указываем директорию для сборки
		emptyOutDir: true, // очищаем директорию перед сборкой
		minify: 'terser', // используем terser для минификации
	},
	plugins: [
		createHtmlPlugin({
			minify: isProd, // минификация только в продакшене
			pages: [
				{
					// Основная страница
					entry: '/js/main.js',
					filename: 'index.html',
					template: 'scr/index.html',
					injectOptions: {
						data: {
							title: 'Vite Pixel Perfect - Главная',
							description: 'Описание главной страницы для SEO',
							keywords: 'vite, scss, pixel perfect, вёрстка',
							header: readHtmlComponent(
								'scr/components/header.html'
							),
							footer: readHtmlComponent(
								'scr/components/footer.html'
							),
							main: readHtmlComponent('scr/components/main.html'),
							isProd, // Передаем флаг режима в шаблон
							buildTime: new Date().toLocaleString('ru-RU'),
						},
						tags: [
							// Добавляем аналитику только в продакшен-сборку
							isProd
								? {
										injectTo: 'body-prepend',
										tag: 'script',
										attrs: {
											src: 'https://www.googletagmanager.com/gtag/js',
											async: true,
										},
								  }
								: null,
							// Добавляем мета-теги для соцсетей
							{
								injectTo: 'head',
								tag: 'meta',
								attrs: {
									property: 'og:title',
									content:
										'Vite Pixel Perfect - Современный подход к вёрстке',
								},
							},
							{
								injectTo: 'head',
								tag: 'meta',
								attrs: {
									property: 'og:description',
									content: 'Описание для социальных сетей',
								},
							},
						].filter(Boolean), // Убираем null из массива
					},
				},
				// Можно добавить другие страницы при необходимости
				// {
				//   filename: 'about.html',
				//   template: 'scr/about.html',
				//   injectOptions: {
				//     data: {
				//       title: 'О нас',
				//       // ...
				//     }
				//   }
				// }
			],
		}),
	],
	css: {
		preprocessorOptions: {
			scss: {
				// здесь можно добавить глобальные импорты SCSS если нужно
			},
		},
		postcss: {
			plugins: [
				autoprefixer(), // добавляем вендорные префиксы
				cssnano({
					preset: [
						'default',
						{
							discardComments: {
								removeAll: true, // удаляем все комментарии
							},
						},
					],
				}), // минифицируем CSS
			],
		},
	},
	server: {
		port: 3000, // порт для локального сервера
		open: true, // автоматически открывать браузер
		strictPort: true, // не использовать другие порты
	},
});
