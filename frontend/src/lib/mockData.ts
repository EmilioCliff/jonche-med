import type { Product, Transaction } from './types';

const PRODUCTS_KEY = 'chemist_products';
const TRANSACTIONS_KEY = 'chemist_transactions';

// Initial mock data
const initialProducts: Product[] = [
	{
		id: '1',
		name: 'Paracetamol 500mg',
		category: 'Pain Relief',
		currentStock: 450,
		minStock: 200,
		maxStock: 1000,
		unit: 'tablets',
		price: 0.15,
		supplier: 'PharmaCo Ltd',
		lastRestocked: new Date(
			Date.now() - 5 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
	{
		id: '2',
		name: 'Amoxicillin 250mg',
		category: 'Antibiotics',
		currentStock: 120,
		minStock: 150,
		maxStock: 500,
		unit: 'capsules',
		price: 0.45,
		supplier: 'MediSupply Inc',
		lastRestocked: new Date(
			Date.now() - 10 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
	{
		id: '3',
		name: 'Ibuprofen 400mg',
		category: 'Pain Relief',
		currentStock: 320,
		minStock: 200,
		maxStock: 800,
		unit: 'tablets',
		price: 0.2,
		supplier: 'PharmaCo Ltd',
		lastRestocked: new Date(
			Date.now() - 3 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
	{
		id: '4',
		name: 'Cetirizine 10mg',
		category: 'Antihistamines',
		currentStock: 85,
		minStock: 100,
		maxStock: 400,
		unit: 'tablets',
		price: 0.3,
		supplier: 'HealthMeds',
		lastRestocked: new Date(
			Date.now() - 15 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
	{
		id: '5',
		name: 'Vitamin D3 1000IU',
		category: 'Supplements',
		currentStock: 210,
		minStock: 150,
		maxStock: 600,
		unit: 'capsules',
		price: 0.25,
		supplier: 'NutriHealth',
		lastRestocked: new Date(
			Date.now() - 7 * 24 * 60 * 60 * 1000,
		).toISOString(),
	},
];

const initialTransactions: Transaction[] = [
	{
		id: '1',
		productId: '1',
		productName: 'Paracetamol 500mg',
		type: 'in',
		quantity: 500,
		date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Wed
		userId: '1',
		userName: 'Admin User',
		batchNumber: 'BATCH-2024-001',
	},
	{
		id: '2',
		productId: '2',
		productName: 'Amoxicillin 250mg',
		type: 'out',
		quantity: 30,
		date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Wed
		userId: '2',
		userName: 'Staff User',
		notes: 'Prescription order',
	},
	{
		id: '3',
		productId: '3',
		productName: 'Ibuprofen 400mg',
		type: 'in',
		quantity: 400,
		date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Thu
		userId: '1',
		userName: 'Admin User',
		batchNumber: 'BATCH-2024-002',
	},
	{
		id: '4',
		productId: '4',
		productName: 'Cetirizine 10mg',
		type: 'out',
		quantity: 20,
		date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Thu
		userId: '2',
		userName: 'Staff User',
		notes: 'Allergy relief',
	},
	{
		id: '5',
		productId: '5',
		productName: 'Vitamin D3 1000IU',
		type: 'in',
		quantity: 200,
		date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Fri
		userId: '1',
		userName: 'Admin User',
		batchNumber: 'BATCH-2024-003',
	},
	{
		id: '6',
		productId: '1',
		productName: 'Paracetamol 500mg',
		type: 'out',
		quantity: 40,
		date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Fri
		userId: '2',
		userName: 'Staff User',
		notes: 'Prescription order',
	},
	{
		id: '7',
		productId: '2',
		productName: 'Amoxicillin 250mg',
		type: 'in',
		quantity: 100,
		date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Sat
		userId: '1',
		userName: 'Admin User',
		batchNumber: 'BATCH-2024-004',
	},
	{
		id: '8',
		productId: '3',
		productName: 'Ibuprofen 400mg',
		type: 'out',
		quantity: 25,
		date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Sat
		userId: '2',
		userName: 'Staff User',
		notes: 'Pain relief',
	},
	{
		id: '9',
		productId: '4',
		productName: 'Cetirizine 10mg',
		type: 'in',
		quantity: 50,
		date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Sun
		userId: '1',
		userName: 'Admin User',
		batchNumber: 'BATCH-2024-005',
	},
	{
		id: '10',
		productId: '5',
		productName: 'Vitamin D3 1000IU',
		type: 'out',
		quantity: 15,
		date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Sun
		userId: '2',
		userName: 'Staff User',
		notes: 'Supplement order',
	},
	{
		id: '11',
		productId: '1',
		productName: 'Paracetamol 500mg',
		type: 'out',
		quantity: 35,
		date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Mon
		userId: '2',
		userName: 'Staff User',
		notes: 'Prescription order',
	},
	{
		id: '12',
		productId: '3',
		productName: 'Ibuprofen 400mg',
		type: 'out',
		quantity: 20,
		date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(), // Today
		userId: '2',
		userName: 'Staff User',
		notes: 'Pain relief',
	},
];

// Products operations
export function getProducts(): Product[] {
	const stored = localStorage.getItem(PRODUCTS_KEY);
	if (!stored) {
		localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
		return initialProducts;
	}
	return JSON.parse(stored);
}

export function saveProduct(product: Product): void {
	const products = getProducts();
	const index = products.findIndex((p) => p.id === product.id);
	if (index >= 0) {
		products[index] = product;
	} else {
		products.push(product);
	}
	localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function deleteProduct(id: string): void {
	const products = getProducts().filter((p) => p.id !== id);
	localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function updateProductStock(
	productId: string,
	quantity: number,
	type: 'in' | 'out',
): void {
	const products = getProducts();
	const product = products.find((p) => p.id === productId);
	if (product) {
		if (type === 'in') {
			product.currentStock += quantity;
			product.lastRestocked = new Date().toISOString();
		} else {
			product.currentStock -= quantity;
		}
		saveProduct(product);
	}
}

// Transactions operations
export function getTransactions(): Transaction[] {
	const stored = localStorage.getItem(TRANSACTIONS_KEY);
	if (!stored) {
		localStorage.setItem(
			TRANSACTIONS_KEY,
			JSON.stringify(initialTransactions),
		);
		return initialTransactions;
	}
	return JSON.parse(stored);
}

export function addTransaction(transaction: Transaction): void {
	const transactions = getTransactions();
	transactions.unshift(transaction);
	localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
	updateProductStock(
		transaction.productId,
		transaction.quantity,
		transaction.type,
	);
}

// Helper to get last 7 days labels
export function getLast7DaysLabels() {
	const days = [];
	const today = new Date();
	for (let i = 6; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
	}
	return days;
}

// Aggregate sales per day
export function getSalesData(transactions: Transaction[]) {
	const today = new Date();
	const salesByDay: { [key: string]: number } = {};
	for (let i = 6; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		const key = d.toLocaleDateString('en-US', { weekday: 'short' });
		salesByDay[key] = 0;
	}
	transactions.forEach((t) => {
		if (t.type === 'out') {
			const date = new Date(t.date);
			const key = date.toLocaleDateString('en-US', { weekday: 'short' });
			if (salesByDay[key] !== undefined) {
				salesByDay[key] += t.quantity;
			}
		}
	});
	return Object.entries(salesByDay).map(([day, sales]) => ({ day, sales }));
}
