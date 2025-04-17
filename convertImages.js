// Скрипт для конвертации и сжатия изображений
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';

// Получаем текущую директорию в ES модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к директориям
const sourceDir = path.resolve(__dirname, 'scr/assets/img/img_to_convert');
const targetDir = path.resolve(__dirname, 'scr/assets/img');

console.log('Директория с исходными изображениями:', sourceDir);
console.log('Директория для оптимизированных изображений:', targetDir);

// Создаем директорию для изображений, если она не существует
fs.ensureDirSync(targetDir);

// Функция для обработки изображений
async function processImages() {
	console.log('Начинаем обработку изображений...');

	// Проверяем, существует ли директория с исходными изображениями
	if (!fs.existsSync(sourceDir)) {
		console.error(
			`Директория с исходными изображениями не найдена: ${sourceDir}`
		);
		return;
	}

	// Получаем список всех файлов в директории с исходными изображениями
	let imageFiles = [];
	try {
		const files = fs.readdirSync(sourceDir);
		imageFiles = files
			.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext);
			})
			.map((file) => path.join(sourceDir, file));
	} catch (error) {
		console.error('Ошибка при чтении директории:', error);
		return;
	}

	console.log(`Найдено файлов изображений: ${imageFiles.length}`);

	if (imageFiles.length === 0) {
		console.log('Изображения не найдены. Проверьте путь и наличие файлов.');
		return;
	}

	// Обрабатываем каждое изображение
	for (const imagePath of imageFiles) {
		const fileName = path.basename(imagePath);
		const fileNameWithoutExt = path.basename(
			imagePath,
			path.extname(imagePath)
		);
		const ext = path.extname(imagePath).toLowerCase();

		console.log(`Обработка ${fileName}...`);

		try {
			// Обработка в зависимости от формата изображения
			if (['.jpg', '.jpeg'].includes(ext)) {
				// JPEG -> оптимизированный JPEG
				await processJpeg(imagePath, path.join(targetDir, fileName));

				// JPEG -> WebP
				await processToWebP(
					imagePath,
					path.join(targetDir, `${fileNameWithoutExt}.webp`)
				);
			} else if (ext === '.png') {
				// PNG -> оптимизированный PNG
				await processPng(imagePath, path.join(targetDir, fileName));

				// PNG -> WebP
				await processToWebP(
					imagePath,
					path.join(targetDir, `${fileNameWithoutExt}.webp`)
				);
			} else if (ext === '.svg') {
				// SVG -> оптимизированный SVG
				await processSvg(imagePath, path.join(targetDir, fileName));
			} else if (ext === '.gif') {
				// GIF -> просто копируем, так как GIF обычно уже оптимизированы
				fs.copyFileSync(imagePath, path.join(targetDir, fileName));
				console.log(`GIF файл ${fileName} скопирован без изменений`);
			}

			console.log(`${fileName} успешно обработан`);
		} catch (error) {
			console.error(`Ошибка при обработке ${fileName}:`, error);
		}
	}

	console.log('Обработка изображений завершена!');
}

// Функция для обработки JPEG изображений
async function processJpeg(inputPath, outputPath) {
	try {
		// Оптимизация JPEG с помощью mozjpeg
		const buffer = await fs.readFile(inputPath);
		const optimizedBuffer = await imagemin.buffer(buffer, {
			plugins: [
				imageminMozjpeg({
					quality: 80, // Качество 0-100
					progressive: true,
				}),
			],
		});

		await fs.writeFile(outputPath, optimizedBuffer);
		console.log(`JPEG оптимизирован: ${path.basename(outputPath)}`);
	} catch (error) {
		throw new Error(`Ошибка при оптимизации JPEG: ${error.message}`);
	}
}

// Функция для обработки PNG изображений
async function processPng(inputPath, outputPath) {
	try {
		// Оптимизация PNG с помощью pngquant
		const buffer = await fs.readFile(inputPath);
		const optimizedBuffer = await imagemin.buffer(buffer, {
			plugins: [
				imageminPngquant({
					quality: [0.6, 0.8], // Диапазон качества
					speed: 1, // 1 (самый медленный, но лучшее качество) до 10
				}),
			],
		});

		await fs.writeFile(outputPath, optimizedBuffer);
		console.log(`PNG оптимизирован: ${path.basename(outputPath)}`);
	} catch (error) {
		throw new Error(`Ошибка при оптимизации PNG: ${error.message}`);
	}
}

// Функция для обработки SVG изображений
async function processSvg(inputPath, outputPath) {
	try {
		// Оптимизация SVG с помощью svgo
		const buffer = await fs.readFile(inputPath);
		const optimizedBuffer = await imagemin.buffer(buffer, {
			plugins: [
				imageminSvgo({
					plugins: [
						{
							name: 'removeViewBox',
							active: false,
						},
						{
							name: 'cleanupIDs',
							active: true,
						},
					],
				}),
			],
		});

		await fs.writeFile(outputPath, optimizedBuffer);
		console.log(`SVG оптимизирован: ${path.basename(outputPath)}`);
	} catch (error) {
		throw new Error(`Ошибка при оптимизации SVG: ${error.message}`);
	}
}

// Функция для конвертации в WebP
async function processToWebP(inputPath, outputPath) {
	try {
		// Конвертация в WebP с помощью sharp
		await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);

		console.log(`Конвертировано в WebP: ${path.basename(outputPath)}`);
	} catch (error) {
		throw new Error(`Ошибка при конвертации в WebP: ${error.message}`);
	}
}

// Запускаем обработку изображений
processImages().catch((error) => {
	console.error('Произошла ошибка:', error);
});
