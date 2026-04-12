'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn, generateSKU } from '@/lib/utils';
import type { Product, Category } from '@/types';

const toNum = (v: unknown) => (v === '' || v === undefined ? 0 : Number(v));

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.preprocess(toNum, z.number().int().min(0)),
  unit: z.string().min(1),
  cost_price: z.preprocess(toNum, z.number().min(0)),
  selling_price: z.preprocess(toNum, z.number().min(0)),
  low_stock_threshold: z.preprocess(toNum, z.number().int().min(0)),
});
type FormData = z.infer<typeof schema>;

interface Props {
  product: Product | null;
  categories: Category[];
  workspaceId: string;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export function ProductModal({ product, categories, workspaceId, onClose, onSaved }: Props) {
  const supabase = createClient();
  const isEdit = !!product;
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(schema) as any,
      defaultValues: product
        ? {
            name: product.name,
            sku: product.sku,
            barcode: product.barcode ?? '',
            description: product.description ?? '',
            category_id: product.category_id ?? '',
            quantity: product.quantity,
            unit: product.unit,
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            low_stock_threshold: product.low_stock_threshold,
          }
        : { quantity: 0, unit: 'pcs', cost_price: 0, selling_price: 0, low_stock_threshold: 10 },
    });

  useEffect(() => {
    if (!isEdit) setValue('sku', generateSKU('NEW'));
  }, [isEdit, setValue]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(productId: string): Promise<string | null> {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop() ?? 'jpg';
    const path = `${workspaceId}/${productId}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    return publicUrl;
  }

  async function onSubmit(data: FormData) {
    const payload = {
      ...data,
      workspace_id: workspaceId,
      category_id: data.category_id || null,
      description: data.description || null,
      barcode: data.barcode || null,
    };

    if (isEdit && product) {
      const imageUrl = await uploadImage(product.id);
      const updatePayload = imageUrl ? { ...payload, image_url: imageUrl } : payload;
      const { data: updated, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', product.id)
        .select('*, category:categories(*)')
        .single();
      if (error) return;
      if (updated) onSaved(updated as Product);
    } else {
      const { data: created, error } = await supabase
        .from('products')
        .insert(payload)
        .select('*, category:categories(*)')
        .single();
      if (error || !created) return;

      // Upload image for new product
      const imageUrl = await uploadImage(created.id);
      if (imageUrl) {
        await supabase.from('products').update({ image_url: imageUrl }).eq('id', created.id);
        created.image_url = imageUrl;
      }

      // Log creation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('inventory_logs').insert({
          workspace_id: workspaceId,
          product_id: created.id,
          user_id: user.id,
          action: 'create',
          quantity_before: 0,
          quantity_after: created.quantity,
          quantity_change: created.quantity,
          note: 'Product created',
        });
      }
      onSaved(created as Product);
    }
  }

  const inputCls = (err?: { message?: string }) =>
    cn('w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
      err ? 'border-red-400' : 'border-gray-300');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 flex items-center justify-center overflow-hidden transition flex-shrink-0"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-gray-300" />
              )}
            </button>
            <div>
              <p className="text-xs font-medium text-gray-700">Product Image</p>
              <p className="text-xs text-gray-400">Click to upload (JPG, PNG, WebP, max 5MB)</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
              <input {...register('name')} className={inputCls(errors.name)} placeholder="e.g. Blue T-Shirt" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
              <input {...register('sku')} className={inputCls(errors.sku)} placeholder="e.g. BLU-001" />
              {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Barcode / UPC</label>
              <input {...register('barcode')} className={inputCls()} placeholder="e.g. 012345678901" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category_id')} className={inputCls()}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={2} className={inputCls()} placeholder="Optional description…" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
              <input {...register('quantity')} type="number" min="0" className={inputCls(errors.quantity)} />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit *</label>
              <select {...register('unit')} className={inputCls()}>
                {['pcs', 'kg', 'g', 'l', 'ml', 'box', 'carton', 'pair', 'set', 'roll', 'm', 'cm'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost Price *</label>
              <input {...register('cost_price')} type="number" min="0" step="0.01" className={inputCls(errors.cost_price)} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price *</label>
              <input {...register('selling_price')} type="number" min="0" step="0.01" className={inputCls(errors.selling_price)} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input {...register('low_stock_threshold')} type="number" min="0" className={inputCls()} />
              <p className="mt-1 text-xs text-gray-400">Alert when stock falls to or below this number.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />{isEdit ? 'Saving…' : 'Adding…'}</> : (isEdit ? 'Save changes' : 'Add product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
