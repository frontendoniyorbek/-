let categoryId = 0;

// Загрузка категорий из LocalStorage
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
	if (storedCategories.length > 0) {
		categoryId = Math.max(...storedCategories.map(category => category.id)) + 1;
		storedCategories.forEach(category => createCategoryFromStorage(category, null));
		updateSubcategoryButtons(); // Обновление кнопок подкатегорий после загрузки
	}
}

// Сохранение категорий в LocalStorage
function saveCategories() {
	const categories = Array.from(document.querySelectorAll('#accordionContainer > .category')).map(category =>
		getCategoryData(category)
	);
	localStorage.setItem('categories', JSON.stringify(categories));
}

// Получение данных категории для сохранения
function getCategoryData(category) {
	const subcategories = Array.from(category.querySelector('.accordion').querySelectorAll(':scope > .category')).map(subcategory =>
		getCategoryData(subcategory)
	);
	return {
		id: parseInt(category.dataset.id, 10),
		name: category.querySelector('input').value,
		isOpen: category.querySelector('.accordion').classList.contains('open'),
		subcategories: subcategories, // Включаем вложенные подкатегории
	};
}

// Создание категории из данных в LocalStorage
function createCategoryFromStorage(data, parent = null) {
	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = data.id;

	// Общий контейнер для toggle-иконки и input
	const headerContainer = document.createElement('div');
	headerContainer.className = 'header-container';

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = data.isOpen ? '▼' : '►';
	toggleIcon.className = `toggle-icon ${data.subcategories.length === 0 ? 'hidden' : ''}`;
	toggleIcon.onclick = () => toggleAccordion(toggleIcon, category);

	// Контейнер для input и кнопки удаления
	const inputContainer = document.createElement('div');
	inputContainer.className = 'input-container';

	const input = document.createElement('input');
	input.type = 'text';
	input.value = data.name;
	input.placeholder = 'Введите название категории';
	input.oninput = saveCategories;

	const deleteBtn = document.createElement('button');
	deleteBtn.innerHTML = `<img src="./images/clode-circle.svg" alt="Удалить">`;
	deleteBtn.className = 'delete-btn';
	deleteBtn.onclick = () => deleteCategory(category, parent);

	inputContainer.append(input, deleteBtn);

	// Добавляем toggleIcon и inputContainer в headerContainer
	headerContainer.append(toggleIcon, inputContainer);

	// Кнопка добавления подкатегории
	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = '+ Добавить подкатегорию 1-уровня';
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category);

	// Аккордеон для подкатегорий
	const accordion = document.createElement('div');
	accordion.classList.add('accordion');
	if (data.isOpen) {
		accordion.classList.add('open');
	}

	// Рекурсивное создание подкатегорий
	if (data.subcategories.length > 0) {
		data.subcategories.forEach(subcategory => createCategoryFromStorage(subcategory, category));
	}

	// Добавляем все элементы в категорию
	category.append(headerContainer, accordion, addSubcategoryBtn);

	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		if (parentAccordion) {
			parentAccordion.appendChild(category);
		}
		const parentToggleIcon = parent.querySelector('.toggle-icon');
		if (parentToggleIcon) {
			parentToggleIcon.classList.remove('hidden');
		}
	} else {
		document.getElementById('accordionContainer').appendChild(category);
	}
}

// Создание новой категории
function createCategory(parent = null) {
	const newCategory = {
		id: categoryId++,
		name: '',
		subcategories: [],
		isOpen: false, // Начальное состояние закрыто
	};

	createCategoryFromStorage(newCategory, parent);
	saveCategories();
	updateSubcategoryButtons(); // Обновляем текст кнопок подкатегорий
}

// Добавление подкатегории
function addSubcategory(parentCategory) {
	createCategory(parentCategory);
	updateSubcategoryButtons(); // Обновляем текст кнопок подкатегорий
}

// Обновление текста кнопок для добавления подкатегорий
function updateSubcategoryButtons() {
	document.querySelectorAll('.add-subcategory-btn').forEach(button => {
		const parentCategory = button.closest('.category');
		const subcategoryCount = parentCategory.querySelectorAll('.accordion > .category').length;
		button.textContent = `+ Добавить подкатегорию ${subcategoryCount + 1}-уровня`;
	});
}

// Переключение состояния аккордеона
function toggleAccordion(toggleIcon, category) {
	const accordion = category.querySelector('.accordion');
	const isOpen = accordion.classList.toggle('open'); // Переключаем состояние открытия

	// Устанавливаем максимальную высоту для аккордеона в зависимости от экрана
	const screenHeight = window.innerHeight;
	const maxHeight = screenHeight * 0.6; // 60% высоты экрана

	// Устанавливаем max-height в зависимости от состояния
	accordion.style.maxHeight = isOpen ? `${maxHeight}px` : '0';

	// Обновляем иконку
	toggleIcon.textContent = isOpen ? '▼' : '►';
	saveCategories(); // Сохраняем состояние
}

// Удаление категории
function deleteCategory(category, parent) {
	category.remove();
	saveCategories();

	// Скрыть иконку toggle, если нет подкатегорий
	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		if (parentAccordion.children.length === 0) {
			parent.querySelector('.toggle-icon').classList.add('hidden');
		}
	}
}

// Событие загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
	loadCategories();
	updateSubcategoryButtons(); // Обновляем кнопки при загрузке
});

// Обработчик кнопки добавления категории
document.getElementById('addCategoryBtn').onclick = () => {
	createCategory();
	updateSubcategoryButtons(); // Обновляем кнопки после создания категории
};
