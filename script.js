let categoryId = 0;

// Функция для добавления подкатегории
function addSubcategory(parentCategory = null) {
	const level = parentCategory ? parseInt(parentCategory.dataset.level, 10) + 1 : 1; // Определяем уровень
	const category = createCategoryElement(level, parentCategory); // Создаем новый элемент категории

	// Добавление подкатегории в родительскую категорию или в основной контейнер
	if (parentCategory) {
		const parentAccordion = parentCategory.querySelector('.accordion');
		parentAccordion.prepend(category); // Вставляем в начало аккордеона родительской категории
		parentCategory.querySelector('.toggle-icon').classList.remove('hidden'); // Показываем иконку раскрытия
	} else {
		const mainContainer = document.getElementById('accordionContainer');
		mainContainer.insertBefore(category, mainContainer.lastElementChild); // Сохраняем кнопку внизу страницы
	}

	saveCategories(); // Сохраняем изменения в LocalStorage
}

// Хелпер: Создание элемента категории
function createCategoryElement(level, parentCategory) {
	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = categoryId++; // Уникальный ID для каждой категории
	category.dataset.level = level; // Уровень категории

	const headerContainer = createHeaderContainer(level, category); // Создаем заголовок категории
	const accordion = document.createElement('div');
	accordion.className = 'accordion';

	// Кнопка для добавления подкатегории
	const addSubcategoryBtn = createAddSubcategoryButton(level, category);

	category.append(headerContainer, accordion, addSubcategoryBtn); // Составляем структуру категории
	return category; // Возвращаем готовую категорию
}

// Хелпер: Создание заголовка категории и поля ввода
function createHeaderContainer(level, category) {
	const headerContainer = document.createElement('div');
	headerContainer.className = 'header-container';

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = '►';
	toggleIcon.className = 'toggle-icon hidden';
	toggleIcon.onclick = () => toggleAccordion(toggleIcon, category); // Обработчик для переключения аккордеона

	const inputContainer = document.createElement('div');
	inputContainer.className = 'input-container';

	const calculatedWidth = calculateInputWidth(level); // Рассчитываем ширину поля ввода
	inputContainer.style.width = calculatedWidth;

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = `Категория ${level}-уровня`;
	input.oninput = saveCategories; // Сохраняем изменения в LocalStorage

	const deleteBtn = createDeleteButton(category); // Кнопка удаления категории

	inputContainer.append(input, deleteBtn);
	headerContainer.append(toggleIcon, inputContainer);

	return headerContainer;
}

// Хелпер: Рассчитываем ширину поля ввода на основе уровня
function calculateInputWidth(level) {
	const maxWidth = 100; // Начальная ширина в процентах
	const widthReduction = 25; // Снижение ширины для каждого уровня
	return `${maxWidth - (level - 1) * widthReduction}px`; // Возвращаем рассчитанную ширину
}

// Хелпер: Создание кнопки удаления категории
function createDeleteButton(category) {
	const deleteBtn = document.createElement('button');
	deleteBtn.innerHTML = `<img src="./images/clode-circle.svg" alt="Удалить">`;
	deleteBtn.className = 'delete-btn';
	deleteBtn.onclick = () => deleteCategory(category); // Обработчик для удаления категории

	return deleteBtn;
}

// Хелпер: Создание кнопки добавления подкатегории
function createAddSubcategoryButton(level, category) {
	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = `+ Добавить подкатегорию ${level + 1}-уровня`;
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category); // Обработчик для добавления подкатегории

	return addSubcategoryBtn;
}

// Функция для переключения состояния аккордеона (открыто/закрыто)
function toggleAccordion(toggleIcon, category) {
	const accordion = category.querySelector('.accordion');
	const isOpen = accordion.classList.toggle('open');
	toggleIcon.textContent = isOpen ? '▼' : '►'; // Меняем иконку в зависимости от состояния
	saveCategories(); // Сохраняем изменения в LocalStorage
}

// Функция для удаления категории
function deleteCategory(category) {
	category.remove(); // Удаляем категорию из DOM
	saveCategories(); // Сохраняем изменения в LocalStorage
}

// Функция для сохранения категорий в LocalStorage
function saveCategories() {
	const categories = Array.from(document.querySelectorAll('#accordionContainer > .category')).map(
		category => getCategoryData(category) // Преобразуем все категории в данные
	);
	localStorage.setItem('categories', JSON.stringify(categories)); // Сохраняем в LocalStorage
}

// Хелпер: Получение данных о категории
function getCategoryData(category) {
	const subcategories = Array.from(category.querySelector('.accordion').querySelectorAll(':scope > .category')).map(
		subcategory => getCategoryData(subcategory) // Рекурсивно получаем данные о подкатегориях
	);
	return {
		id: parseInt(category.dataset.id, 10), // ID категории
		name: category.querySelector('input').value, // Имя категории
		isOpen: category.querySelector('.accordion').classList.contains('open'), // Состояние аккордеона
		subcategories: subcategories, // Список подкатегорий
	};
}

// Функция для загрузки категорий из LocalStorage
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories')) || []; // Получаем категории из LocalStorage
	if (storedCategories.length > 0) {
		categoryId = Math.max(...storedCategories.map(category => category.id)) + 1; // Обновляем максимальный ID
		storedCategories.forEach(category => createCategoryFromStorage(category, null)); // Воссоздаем категории
	}
}

// Функция для создания категории из данных LocalStorage
function createCategoryFromStorage(data, parent = null) {
	const category = addSubcategory(parent); // Создаем категорию
	if (category) {
		const input = category.querySelector('input');
		input.value = data.name; // Восстанавливаем имя категории

		if (data.isOpen) {
			toggleAccordion(category.querySelector('.toggle-icon'), category); // Восстанавливаем состояние аккордеона
		}
	}

	// Рекурсивно восстанавливаем подкатегории
	data.subcategories.forEach(subcategory => createCategoryFromStorage(subcategory, category));
}

// Загрузка категорий при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
	loadCategories(); // Загружаем категории из LocalStorage
	const mainButton = document.querySelector('.add-subcategory-btn');
	if (mainButton) {
		mainButton.onclick = () => addSubcategory(); // Привязываем обработчик для добавления категории
	}
});
