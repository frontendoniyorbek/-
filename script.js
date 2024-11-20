let categoryId = 0;

// LocalStorage'dan ma'lumotlarni yuklash
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
	if (storedCategories.length > 0) {
		categoryId = Math.max(...storedCategories.map(category => category.id)) + 1;
		storedCategories.forEach(category => createCategoryFromStorage(category, null));
	}
}

// LocalStorage'ga kategoriyalarni saqlash
function saveCategories() {
	const categories = [];
	document.querySelectorAll('#accordionContainer > .category').forEach(category => {
		categories.push(getCategoryData(category));
	});
	localStorage.setItem('categories', JSON.stringify(categories));
}

// Kategoriya ma'lumotlarini olish
function getCategoryData(category) {
	const subcategories = [];
	category
		.querySelector('.accordion')
		.querySelectorAll(':scope > .category')
		.forEach(subcategory => {
			subcategories.push(getCategoryData(subcategory));
		});

	return {
		id: parseInt(category.dataset.id, 10),
		name: category.querySelector('input').value,
		isOpen: category.querySelector('.accordion').classList.contains('open'), // Track open/close state
		subcategories: subcategories,
	};
}

// LocalStorage'dan yuklangan kategoriyani yaratish
function createCategoryFromStorage(data, parent = null) {
	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = data.id;

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = data.isOpen ? '▲' : '▼'; // Show open/close icon based on state
	toggleIcon.className = `toggle-icon ${data.subcategories.length === 0 ? 'hidden' : ''}`;
	toggleIcon.onclick = () => toggleAccordion(toggleIcon, category);

	const input = document.createElement('input');
	input.type = 'text';
	input.value = data.name;
	input.placeholder = 'Введите название категории';
	input.oninput = () => saveCategories();

	const deleteBtn = document.createElement('button');
	deleteBtn.textContent = 'X';
	deleteBtn.className = 'delete-btn';
	deleteBtn.onclick = () => deleteCategory(category, parent);

	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = '+ Добавить подкатегорию';
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category);

	const accordion = document.createElement('div');
	accordion.classList.add('accordion');
	if (data.isOpen) {
		accordion.classList.add('open'); // Apply open state if category was saved as open
	}

	// Subkategoriyalarni rekursiv tarzda yuklash
	if (data.subcategories.length > 0) {
		data.subcategories.forEach(subcategory => createCategoryFromStorage(subcategory, category));
	}

	category.append(toggleIcon, input, deleteBtn, accordion, addSubcategoryBtn);

	// Agar parent bo'lsa, uni tekshirish va kategoriya qo'shish
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
		// Agar root bo'lsa, asosiy konteynerga qo'shish
		document.getElementById('accordionContainer').appendChild(category);
	}
}

// Yangi kategoriya yaratish
function createCategory(parent = null) {
	const newCategory = {
		id: categoryId++,
		name: '',
		subcategories: [],
		isOpen: false, // Default state is closed
	};

	createCategoryFromStorage(newCategory, parent);
	saveCategories();
}

// Subkategoriya qo'shish
function addSubcategory(parentCategory) {
	createCategory(parentCategory);
}

// Accordionni ochish/yopish
function toggleAccordion(toggleIcon, category) {
	const accordion = category.querySelector('.accordion');
	const isOpen = accordion.classList.toggle('open'); // Toggle the open state
	toggleIcon.textContent = isOpen ? '▲' : '▼'; // Change the icon based on the state

	saveCategories(); // Save the state of the categories to localStorage after toggle
}

// Kategoriya o'chirish
function deleteCategory(category, parent) {
	category.remove();
	saveCategories();

	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		if (parentAccordion.children.length === 0) {
			parent.querySelector('.toggle-icon').classList.add('hidden');
		}
	}
}

// Sahifani yangilagan paytda LocalStorage'dan kategoriyalarni yuklash
document.addEventListener('DOMContentLoaded', function () {
	loadCategories();
});

// Hodisa yuklash
document.getElementById('addCategoryBtn').onclick = () => createCategory();
