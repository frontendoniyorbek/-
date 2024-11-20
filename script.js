let categoryId = 0;

// localStorage'dan ma'lumotlarni olish
function loadCategories() {
	const storedCategories = JSON.parse(localStorage.getItem('categories'));
	if (storedCategories) {
		categoryId = storedCategories.length > 0 ? Math.max(...storedCategories.map(item => item.id)) + 1 : 0;
		storedCategories.forEach(category => createCategoryFromStorage(category));
	}
}

// localStorage'ga saqlash
function saveCategories() {
	const categories = [];
	document.querySelectorAll('.category').forEach(category => {
		categories.push(getCategoryData(category));
	});
	localStorage.setItem('categories', JSON.stringify(categories));
}

function createCategory(parent = null) {
	categoryId++;
	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = categoryId;

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = '▼';
	toggleIcon.className = 'toggle-icon hidden';
	toggleIcon.onclick = () => toggleAccordion(toggleIcon);

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Введите название категории';
	input.oninput = () => saveCategories();

	const deleteBtn = document.createElement('button');
	deleteBtn.textContent = 'X';
	deleteBtn.className = 'delete-btn';
	deleteBtn.onclick = () => deleteCategory(category, parent);

	const addSubcategoryBtn = document.createElement('button');
	addSubcategoryBtn.textContent = `+ Добавить подкатегорию 1-уровня`; // Dastlabki holat
	addSubcategoryBtn.className = 'add-subcategory-btn';
	addSubcategoryBtn.onclick = () => addSubcategory(category);

	const accordion = document.createElement('div');
	accordion.classList.add('accordion');

	category.append(toggleIcon, input, deleteBtn, accordion, addSubcategoryBtn);

	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		parentAccordion.appendChild(category);
		parent.querySelector('.toggle-icon').classList.remove('hidden');
		updateAddSubcategoryText(parent); // Tugma textini yangilash
	} else {
		document.getElementById('accordionContainer').appendChild(category);
	}

	saveCategories();
}

function updateAddSubcategoryText(parentCategory) {
	const subcategories = parentCategory.querySelectorAll('.category');
	const addSubcategoryBtn = parentCategory.querySelector('.add-subcategory-btn');
	addSubcategoryBtn.textContent = `+ Добавить подкатегорию ${subcategories.length + 1}-уровня`;
}

// Kategoriyani ma'lumotlarini olish
function getCategoryData(category) {
	const subcategories = [];
	category.querySelectorAll('.category').forEach(subcategory => {
		subcategories.push(getCategoryData(subcategory));
	});

	return {
		id: category.dataset.id,
		name: category.querySelector('input').value,
		subcategories: subcategories,
	};
}

// Accordionni ochish va yopish
function toggleAccordion(toggleIcon) {
	const category = toggleIcon.closest('.category');
	const accordion = category.querySelector('.accordion');
	accordion.classList.toggle('open');
	saveCategories();
}

// Yangi kategoriya qo'shish
function addCategory() {
	createCategory();
	saveCategories();
}

function addSubcategory(parentCategory) {
	createCategory(parentCategory);
	updateAddSubcategoryText(parentCategory); // Textni yangilash
	saveCategories();
}

function deleteCategory(category, parent) {
	category.remove();
	saveCategories();
	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		if (parentAccordion.children.length === 0) {
			parent.querySelector('.toggle-icon').classList.add('hidden');
		}
		updateAddSubcategoryText(parent); // Textni yangilash
	}
}

// Kategoriya yaratish (yangi kategoriya yaratish)
function createCategory(parent = null) {
	categoryId++;
	const category = document.createElement('div');
	category.classList.add('category');
	category.dataset.id = categoryId;

	const toggleIcon = document.createElement('span');
	toggleIcon.textContent = '▼';
	toggleIcon.className = 'toggle-icon hidden';
	toggleIcon.onclick = () => toggleAccordion(toggleIcon);

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = 'Введите название категории';
	input.oninput = () => saveCategories();

	// Adding the delete button functionality
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

	category.append(toggleIcon, input, deleteBtn, addSubcategoryBtn, accordion);

	if (parent) {
		const parentAccordion = parent.querySelector('.accordion');
		parentAccordion.appendChild(category);
		parent.querySelector('.toggle-icon').classList.remove('hidden');
	} else {
		document.getElementById('accordionContainer').appendChild(category);
	}

	saveCategories();
}

// localStorage'dan saqlangan subcategories ni olish
function getSubcategoriesFromLocalStorage() {
	// localStorage'dan 'categories' nomli ma'lumotni o'qing
	const categories = JSON.parse(localStorage.getItem('categories'));

	// Agar ma'lumot mavjud bo'lsa, uni qaytaring
	if (categories) {
		return categories;
	} else {
		return []; // Agar ma'lumot bo'lmasa, bo'sh massiv qaytaring
	}
}

// Saqlangan subcategoriesni konsolga chiqarish
const savedSubcategories = getSubcategoriesFromLocalStorage();
console.log(savedSubcategories);
// Initial load from localStorage
loadCategories();
