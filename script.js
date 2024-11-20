let categoryId = 0;

// Kategoriya qo'shish funksiyasi
function addSubcategory(parentCategory = null) {
	const level = parentCategory ? parseInt(parentCategory.dataset.level, 10) + 1 : 1;

	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = categoryId++;
	category.dataset.level = level;

	// Kategoriya sarlavhasi
	const headerContainer = document.createElement('div');
	headerContainer.className = 'header-container';

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = '►';
	toggleIcon.className = 'toggle-icon hidden';
	toggleIcon.onclick = () => toggleAccordion(toggleIcon, category);

	// Input va o'chirish tugmasi uchun konteyner
	const inputContainer = document.createElement('div');
	inputContainer.className = 'input-container';

	// Dinamik kenglikni hisoblash
	const maxWidth = 100; // Boshlang'ich kenglik foizda
	const widthReduction = 25; // Har bir daraja uchun kamayish (px)
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

	// Accordion qismi
	const accordion = document.createElement('div');
	accordion.className = 'accordion';

	// Yangi tugma
	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = `+ Добавить подкатегорию ${level + 1}-уровня`;
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category);

	// Strukturani birlashtirish
	category.append(headerContainer, accordion, addSubcategoryBtn);

	// Qo'shilayotgan subkategoriya o'z tugmachasi bilan joylashadi
	if (parentCategory) {
		const parentAccordion = parentCategory.querySelector('.accordion');
		parentAccordion.prepend(category);
		parentCategory.querySelector('.toggle-icon').classList.remove('hidden');
	} else {
		const mainContainer = document.getElementById('accordionContainer');
		mainContainer.insertBefore(category, mainContainer.lastElementChild); // Tugmani pastda saqlaydi
	}

	saveCategories();
}

// Accordionni ochish/yopish funksiyasi
function toggleAccordion(toggleIcon, category) {
	const accordion = category.querySelector('.accordion');
	const isOpen = accordion.classList.toggle('open');
	toggleIcon.textContent = isOpen ? '▼' : '►';
	saveCategories();
}

// Kategoriya o'chirish funksiyasi
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

// LocalStorage'ni boshqarish
function saveCategories() {
	// Barcha kategoriyalarni JSON formatida saqlash
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

// LocalStorage'dan ma'lumotlarni yuklash
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
	if (storedCategories.length > 0) {
		categoryId = Math.max(...storedCategories.map(category => category.id)) + 1;
		storedCategories.forEach(category => createCategoryFromStorage(category, null));
	}
}

// LocalStorage'dan kategoriya yaratish
function createCategoryFromStorage(data, parent = null) {
	const category = addSubcategory(parent);
	const input = category.querySelector('input');
	input.value = data.name;

	if (data.isOpen) {
		toggleAccordion(category.querySelector('.toggle-icon'), category);
	}

	data.subcategories.forEach(subcategory => createCategoryFromStorage(subcategory, category));
}

// Sahifa yuklanganda yuklash
document.addEventListener('DOMContentLoaded', () => {
	loadCategories();
	const mainButton = document.getElementById('addMainCategory');
	mainButton.onclick = () => addSubcategory();
});
