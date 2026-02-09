'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, X, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  description: string;
  stock: number;
  imageUrl?: string;
  subCategoryId?: string;
  manufacturers?: string;
  type?: string;
  packaging?: string;
  package?: string;
  Qty?: string;
  productForm?: string;
  productHighlights?: string;
  information?: string;
  keyIngredients?: string;
  keyBenefits?: string;
  directionsForUse?: string;
  safetyInformation?: string;
  manufacturerAddress?: string;
  countryOfOrigin?: string;
  manufacturerDetails?: string;
  marketerDetails?: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [isAddSubCategoryDialogOpen, setIsAddSubCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    subCategoryId: '',
    manufacturers: '',
    type: '',
    packaging: '',
    package: '',
    Qty: '',
    productForm: '',
    productHighlights: '',
    information: '',
    keyIngredients: '',
    keyBenefits: '',
    directionsForUse: '',
    safetyInformation: '',
    manufacturerAddress: '',
    countryOfOrigin: '',
    manufacturerDetails: '',
    marketerDetails: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  const types = ['Product', 'Medicine'];
  const manufacturers = Array.from(new Set(products.map(p => p.manufacturers))).sort();
  const stockStatuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products');

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      const productArray = Array.isArray(data.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [];

      setProducts(productArray);
      setFilteredProducts(productArray);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...products];

    if (selectedManufacturer) {
      result = result.filter(product => product.manufacturers === selectedManufacturer);
    }

    if (selectedStockStatus && selectedStockStatus !== 'All') {
      if (selectedStockStatus === 'Low Stock') {
        result = result.filter(product => product.stock > 0 && product.stock <= 10);
      } else if (selectedStockStatus === 'In Stock') {
        result = result.filter(product => product.stock > 10);
      } else if (selectedStockStatus === 'Out of Stock') {
        result = result.filter(product => product.stock === 0);
      }
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (tableSearchQuery) {
      const lowerCaseQuery = tableSearchQuery.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(lowerCaseQuery) ||
          product.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    setFilteredProducts(result);
  }, [
    selectedType,
    selectedManufacturer,
    selectedStockStatus,
    searchQuery,
    tableSearchQuery,
    products,
  ]);

  const resetFilters = () => {
    setSelectedType('');
    setSelectedManufacturer('');
    setSelectedStockStatus('');
    setSearchQuery('');
    setTableSearchQuery('');
  };

  const getStockClassName = (quantity: number) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity <= 10) return 'text-amber-600';
    return 'text-green-600';
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/category');
        const data = await response.json();
        if (Array.isArray(data)) setCategories(data);
        else if (Array.isArray(data.categories)) setCategories(data.categories);
        else setCategories([]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Open Add Product modal
  const openAddDialog = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: '',
      subCategoryId: '',
      manufacturers: '',
      type: '',
      packaging: '',
      package: '',
      Qty: '',
      productForm: '',
      productHighlights: '',
      information: '',
      keyIngredients: '',
      keyBenefits: '',
      directionsForUse: '',
      safetyInformation: '',
      manufacturerAddress: '',
      countryOfOrigin: '',
      manufacturerDetails: '',
      marketerDetails: '',
    });
    setSelectedCategory('');
    setSelectedSubCategory('');
    setIsAddDialogOpen(true);
  };

  // Open Edit Product modal
  const openEditDialog = (product: Product) => {
    setIsEditMode(true);
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      subCategoryId: product.subCategoryId || '',
      manufacturers: product.manufacturers || '',
      type: product.type || '',
      packaging: product.packaging || '',
      package: product.package || '',
      Qty: product.Qty || '',
      productForm: product.productForm || '',
      productHighlights: product.productHighlights || '',
      information: product.information || '',
      keyIngredients: product.keyIngredients || '',
      keyBenefits: product.keyBenefits || '',
      directionsForUse: product.directionsForUse || '',
      safetyInformation: product.safetyInformation || '',
      manufacturerAddress: product.manufacturerAddress || '',
      countryOfOrigin: product.countryOfOrigin || '',
      manufacturerDetails: product.manufacturerDetails || '',
      marketerDetails: product.marketerDetails || '',
    });

    const category = categories.find(cat =>
      cat.subCategories.some(sub => sub.id === product.subCategoryId)
    );
    if (category) {
      setSelectedCategory(category.id);
      setSelectedSubCategory(product.subCategoryId || '');
    }

    setIsAddDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add / Edit submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      subCategoryId: selectedSubCategory,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      let res;
      if (isEditMode && editingProductId) {
        res = await fetch(`/api/admin/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(isEditMode ? 'Product Updated!' : 'Product Added!');
        if (!isEditMode) {
          setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            imageUrl: '',
            subCategoryId: '',
            manufacturers: '',
            type: '',
            packaging: '',
            package: '',
            Qty: '',
            productForm: '',
            productHighlights: '',
            information: '',
            keyIngredients: '',
            keyBenefits: '',
            directionsForUse: '',
            safetyInformation: '',
            manufacturerAddress: '',
            countryOfOrigin: '',
            manufacturerDetails: '',
            marketerDetails: '',
          });
          setSelectedCategory('');
          setIsAddDialogOpen(true);
        } else {
          setIsAddDialogOpen(false);
        }

        fetchProducts();
      } else {
        toast.error('Failed to save product');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
      setFormError('Failed. Please try again.');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Category Added!');
        setNewCategoryName('');
        // Refresh categories
        const updatedCategories = await fetch('/api/admin/category').then(res => res.json());
        setCategories(
          Array.isArray(updatedCategories) ? updatedCategories : updatedCategories.categories || []
        );
      } else {
        toast.error(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryForSub || !newSubCategoryName.trim()) {
      toast.error('Please select a category and enter subcategory name');
      return;
    }

    try {
      const res = await fetch('/api/admin/subcategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategoryForSub,
          name: newSubCategoryName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Subcategory Added!');
        setIsAddSubCategoryDialogOpen(false);
        // Refresh categories
        const updatedCategories = await fetch('/api/admin/category').then(res => res.json());
        setCategories(
          Array.isArray(updatedCategories) ? updatedCategories : updatedCategories.categories || []
        );
      } else {
        toast.error(data.message || 'Failed to add subcategory');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Product deleted successfully!');
        setProducts(prev => prev.filter(p => p.id !== id));
        setFilteredProducts(prev => prev.filter(p => p.id !== id));
        fetchProducts();
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while deleting.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p>Manage inventory, add new products, and update pricing information.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSelectedCategoryForSub('');
              setNewSubCategoryName('');
              setIsAddSubCategoryDialogOpen(true);
            }}
            className="bg-background1 flex items-center rounded-md px-3 py-2 text-white"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>

          <button
            onClick={openAddDialog}
            className="bg-background1 flex items-center rounded-md px-4 py-2 text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>
      <div className="rounded bg-blue-100 px-4 py-2 text-blue-800">
        Total Products: {filteredProducts.length}
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                <option key="all-types" value="">
                  All Types
                </option>
                {types.map(type => (
                  <option key={`type-${type}`} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Manufacturer</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={selectedManufacturer}
                onChange={e => setSelectedManufacturer(e.target.value)}
              >
                <option key="all-manufacturers" value="">
                  All Manufacturers
                </option>
                {manufacturers.map(manufacturer => (
                  <option key={`manufacturer-${manufacturer}`} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Stock Status</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={selectedStockStatus}
                onChange={e => setSelectedStockStatus(e.target.value)}
              >
                {stockStatuses.map(status => (
                  <option key={`stock-${status}`} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="mb-2 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={resetFilters}
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-md bg-white shadow">
          <div className="flex flex-col items-center justify-between border-b p-4 md:flex-row">
            <div className="mb-4 flex items-center md:mb-0">
              <span className="mr-2">Show</span>
              <select
                className="rounded-md border border-gray-300 px-2 py-1"
                value={entriesPerPage}
                onChange={e => setEntriesPerPage(Number(e.target.value))}
              >
                <option key="entries-10" value={10}>
                  10
                </option>
                <option key="entries-25" value={25}>
                  25
                </option>
                <option key="entries-50" value={50}>
                  50
                </option>
                <option key="entries-100" value={100}>
                  100
                </option>
              </select>
              <span className="ml-2">entries</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="rounded-md border border-gray-300 px-3 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                value={tableSearchQuery}
                onChange={e => setTableSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.slice(0, entriesPerPage).map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap">
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-white">
                          {product?.imageUrl ? (
                            <div className="relative h-10 w-10">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name.length > 40
                            ? `${product.name.slice(0, 40)}...`
                            : product.name}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.description.length > 40
                            ? `${product.description.slice(0, 40)}...`
                            : product.description}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{Number(product.price).toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className={`text-sm ${getStockClassName(product.stock)}`}>
                          {getStockStatus(product.stock)} ({product.stock})
                        </div>
                      </td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => openEditDialog(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-secondaryColor hover:text-red-800"
                            onClick={() => handleRemove(product.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">{error}</div>}

      {/* Modal */}
      {isAddDialogOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="no-scrollbar max-h-[90vh] w-full max-w-2xl items-center overflow-y-auto rounded-lg bg-white p-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close dialog"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 rounded-md bg-red-100 p-2 text-red-700">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="w-full space-y-4 rounded px-8 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                {/* Name */}
                <div>
                  <label className="text-md font-medium">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-md font-medium">Price *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Description *</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>

                {/* Manufacturers */}
                <div>
                  <label className="text-md font-medium">Manufacturers</label>
                  <input
                    type="text"
                    name="manufacturers"
                    placeholder="Manufacturers"
                    value={formData.manufacturers}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="text-md font-medium">Type</label>
                  <input
                    type="text"
                    name="type"
                    placeholder="Type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Packaging */}
                <div>
                  <label className="text-md font-medium">Packaging</label>
                  <input
                    type="text"
                    name="packaging"
                    placeholder="Packaging"
                    value={formData.packaging}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Package */}
                <div>
                  <label className="text-md font-medium">Package</label>
                  <input
                    type="text"
                    name="package"
                    placeholder="Package"
                    value={formData.package}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Qty */}
                <div>
                  <label className="text-md font-medium">Quantity</label>
                  <input
                    type="text"
                    name="Qty"
                    placeholder="Package Qty"
                    value={formData.Qty}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Product Form */}
                <div>
                  <label className="text-md font-medium">Product Form</label>
                  <input
                    type="text"
                    name="productForm"
                    placeholder="e.g. Tablet, Syrup"
                    value={formData.productForm}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Product Highlights */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Product Highlights</label>
                  <textarea
                    name="productHighlights"
                    placeholder="Highlights"
                    value={formData.productHighlights}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Information */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Information</label>
                  <textarea
                    name="information"
                    placeholder="Product Information"
                    value={formData.information}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Key Ingredients */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Key Ingredients</label>
                  <textarea
                    name="keyIngredients"
                    placeholder="Key Ingredients"
                    value={formData.keyIngredients}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Key Benefits */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Key Benefits</label>
                  <textarea
                    name="keyBenefits"
                    placeholder="Key Benefits"
                    value={formData.keyBenefits}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Directions For Use */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Directions for Use</label>
                  <textarea
                    name="directionsForUse"
                    placeholder="Directions"
                    value={formData.directionsForUse}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Safety Information */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Safety Information</label>
                  <textarea
                    name="safetyInformation"
                    placeholder="Safety Information"
                    value={formData.safetyInformation}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Manufacturer Address */}
                <div className="col-span-2">
                  <label className="text-md font-medium">Manufacturer Address</label>
                  <textarea
                    name="manufacturerAddress"
                    placeholder="Address"
                    value={formData.manufacturerAddress}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Country Of Origin */}
                <div>
                  <label className="text-md font-medium">Country of Origin</label>
                  <input
                    type="text"
                    name="countryOfOrigin"
                    placeholder="Country"
                    value={formData.countryOfOrigin}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Manufacturer Details */}
                <div>
                  <label className="text-md font-medium">Manufacturer Details</label>
                  <input
                    type="text"
                    name="manufacturerDetails"
                    placeholder="Manufacturer Details"
                    value={formData.manufacturerDetails}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Marketer Details */}
                <div>
                  <label className="text-md font-medium">Marketer Details</label>
                  <input
                    type="text"
                    name="marketerDetails"
                    placeholder="Marketer Details"
                    value={formData.marketerDetails}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-md font-medium">Category *</label>
                  <select
                    value={selectedCategory}
                    onChange={e => {
                      setSelectedCategory(e.target.value);
                      setSelectedSubCategory('');
                    }}
                    className="w-full rounded border p-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="text-md font-medium">Sub Category *</label>
                  <select
                    value={selectedSubCategory}
                    onChange={e => setSelectedSubCategory(e.target.value)}
                    className="w-full rounded border p-2"
                    disabled={!selectedCategory}
                    required
                  >
                    <option value="">Select SubCategory</option>
                    {selectedCategory &&
                      categories
                        .find(cat => cat.id === selectedCategory)
                        ?.subCategories?.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="text-md font-medium">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full rounded border p-2"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-md font-medium">Product Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full rounded border p-2"
                    required={!isEditMode}
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        width={100}
                        height={100}
                        className="rounded border object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 mt-7 flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="cursor-pointer rounded bg-gray-300 px-4 py-2 text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
                  >
                    {isEditMode ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">{error}</div>}

      {isAddSubCategoryDialogOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Subcategory</h2>
              <button
                onClick={() => setIsAddSubCategoryDialogOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 rounded-md bg-red-100 p-2 text-red-700">{formError}</div>
            )}
            <form
              onSubmit={handleCategorySubmit}
              className="flex items-center justify-between space-y-4"
            >
              <div className="w-88">
                <label className="text-md font-medium">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full rounded border p-2"
                  placeholder="Enter Category Name"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="cursor-pointer rounded bg-blue-500 px-2 py-2 text-white"
                >
                  Add Category
                </button>
              </div>
            </form>
            {formError && (
              <div className="mb-4 rounded-md bg-red-100 p-2 text-red-700">{formError}</div>
            )}
            <form onSubmit={handleSubCategorySubmit} className="space-y-4">
              <div className="flex justify-between gap-5">
                <div className="w-full">
                  <label className="text-md font-medium">Category *</label>
                  <select
                    value={selectedCategoryForSub}
                    onChange={e => setSelectedCategoryForSub(e.target.value)}
                    className="h-10 w-full rounded border p-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <label className="text-md font-medium">Subcategory Name *</label>
                  <input
                    type="text"
                    value={newSubCategoryName}
                    onChange={e => setNewSubCategoryName(e.target.value)}
                    className="w-full rounded border p-2"
                    placeholder="Enter Subcategory Name"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddSubCategoryDialogOpen(false)}
                  className="cursor-pointer rounded bg-gray-300 px-4 py-2 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white"
                >
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
