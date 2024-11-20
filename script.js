let categoryId = 0;

function addSubcategory(parentCategory = null) {
	const level = parentCategory ? parseInt(parentCategory.dataset.level, 10) + 1 : 1;

	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = categoryId++;
	category.dataset.level = level;

	// Заголовок категории
	const headerContainer = document.createElement('div');
	headerContainer.className = 'header-container';

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = '►';
	toggleIcon.className = 'toggle-icon hidden';
	toggleIcon.onclick = () => toggleAccordion(toggleIcon, category);

	// Контейнер для ввода и кнопки удаления
	const inputContainer = document.createElement('div');
	inputContainer.className = 'input-container';

	// Расчет динамической ширины
	const maxWidth = 100; // Начальная ширина в процентах
	const widthReduction = 25; // Уменьшение ширины на каждом уровне (px)
	const calculatedWidth = `${maxWidth - (level - 1) * widthReduction}px`;

	inputContainer.style.width = calculatedWidth;

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = `Категория ${level}-уровня`;
	input.oninput = saveCategories;

	const deleteBtn = document.createElement('button');
	deleteBtn.innerHTML = `<img src="./images/clode-circle.svg" alt="Удалить">`;
	deleteBtn.className = 'delete-btn';
	deleteBtn.onclick = () => deleteCategory(category, parentCategory);

	inputContainer.append(input, deleteBtn);

	headerContainer.append(toggleIcon, inputContainer);

	// Часть аккордеона
	const accordion = document.createElement('div');
	accordion.className = 'accordion';

	// Кнопка добавления подкатегории
	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = `+ Добавить подкатегорию ${level + 1}-уровня`;
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category);

	// Сборка структуры
	category.append(headerContainer, accordion, addSubcategoryBtn);

	// Добавление новой подкатегории в нужное место
	if (parentCategory) {
		const parentAccordion = parentCategory.querySelector('.accordion');
		parentAccordion.prepend(category);
		parentCategory.querySelector('.toggle-icon').classList.remove('hidden');
	} else {
		const mainContainer = document.getElementById('accordionContainer');
		mainContainer.insertBefore(category, mainContainer.querySelector('.add-subcategory-btn'));
	}

	saveCategories();
}

// Функция открытия/закрытия аккордеона
function toggleAccordion(toggleIcon, category) {
	const accordion = category.querySelector('.accordion');
	const isOpen = accordion.classList.toggle('open');
	toggleIcon.textContent = isOpen ? '▼' : '►';
	saveCategories();
}

// Функция удаления категории
function deleteCategory(category, parentCategory) {
	category.remove();
	saveCategories();

	if (parentCategory) {
		const parentAccordion = parentCategory.querySelector('.accordion');
		if (!parentAccordion.children.length) {
			parentCategory.querySelector('.toggle-icon').classList.add('hidden');
		}
	}
}

// Управление LocalStorage
function saveCategories() {
	// Сохранение всех категорий в формате JSON
	const categories = Array.from(document.querySelectorAll('#accordionContainer > .category')).map(category =>
		getCategoryData(category)
	);
	localStorage.setItem('categories', JSON.stringify(categories));
}

function getCategoryData(category) {
	const subcategories = Array.from(category.querySelector('.accordion').querySelectorAll(':scope > .category')).map(subcategory =>
		getCategoryData(subcategory)
	);
	return {
		id: parseInt(category.dataset.id, 10),
		name: category.querySelector('input').value,
		isOpen: category.querySelector('.accordion').classList.contains('open'),
		subcategories: subcategories,
	};
}

// Загрузка данных из LocalStorage
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
	if (storedCategories.length > 0) {
		categoryId = Math.max(...storedCategories.map(category => category.id)) + 1;
		storedCategories.forEach(category => createCategoryFromStorage(category, null));
	}
}

// Создание категории из данных в LocalStorage
function createCategoryFromStorage(data, parent = null) {
	addSubcategory(parent); // Автоматическое создание подкатегории
}

// Загрузка данных при открытии страницы
document.addEventListener('DOMContentLoaded', () => {
	loadCategories();
});

// Управление кнопкой внизу для добавления подкатегорий
document.querySelector('.add-subcategory-btn').onclick = () => {
	addSubcategory();
};
