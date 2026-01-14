'use client';
import useSeller from '@src/hooks/useSeller';
import { ProductCard } from '@src/shared/components/cards';
import axiosInstance from '@src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Camera,
  Clock,
  Edit3,
  ExternalLink,
  Globe,
  MapPin,
  Package,
  Save,
  ShoppingBag,
  Star,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Social media icons
const socialIcons: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  twitter: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  youtube: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};

interface ShopData {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: { id: string; fileId: string; url: string }[];
  coverBanner: string | null;
  address: string;
  openingHours: string | null;
  website: string | null;
  socialLinks: { platform: string; url: string }[];
  ratings: number;
  followersCount: number;
  createdAt: string;
  _count: {
    products: number;
    followers: number;
    reviews: number;
  };
  reviews: any[];
}

interface EditFormData {
  name: string;
  description: string;
  address: string;
  openingHours: string;
  website: string;
  category: string;
}

type ActiveTab = 'products' | 'offers' | 'reviews';

const ShopProfilePage = () => {
  const { refetch: refetchSeller } = useSeller();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Helper function to format category names (e.g., "gardening_plants" → "Gardening Plants")
  const formatCategory = (category: string) => {
    return category
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  const [editingSocialLinks, setEditingSocialLinks] = useState(false);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  // Fetch shop profile
  const { data: shopData, isLoading } = useQuery({
    queryKey: ['shop-profile'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/get-shop-profile');
      return res?.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const shop: ShopData | null = shopData?.shop || null;

  // Fetch shop products
  const { data: productsData } = useQuery({
    queryKey: ['shop-products-preview'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/products/api/get-shop-products?limit=6'
      );
      return res?.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch shop events
  const { data: eventsData } = useQuery({
    queryKey: ['shop-events-preview'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/products/api/get-shop-events?limit=6&status=active'
      );
      return res?.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const products = productsData?.products || [];
  const events = eventsData?.events || [];

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        description: shop.description,
        address: shop.address,
        openingHours: shop.openingHours || '',
        website: shop.website || '',
        category: shop.category,
      });
      setSocialLinks(shop.socialLinks || []);
    }
  }, [shop, reset]);

  // Update shop mutation
  const updateShopMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.put('/api/update-shop-profile', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Shop profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-profile'] });
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      setIsEditModalOpen(false);
      setEditingSocialLinks(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const base64Image = await convertToBase64(file);
      await axiosInstance.post('/api/upload-shop-avatar', {
        image: base64Image,
      });
      toast.success('Avatar updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-profile'] });
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      refetchSeller();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Upload cover
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const base64Image = await convertToBase64(file);
      await axiosInstance.post('/api/upload-shop-cover', {
        image: base64Image,
      });
      toast.success('Cover updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['shop-profile'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload cover');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onSubmit = (data: EditFormData) => {
    updateShopMutation.mutate(data);
  };

  const handleSaveSocialLinks = () => {
    updateShopMutation.mutate({ socialLinks });
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (
    index: number,
    field: 'platform' | 'url',
    value: string
  ) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(40,42,56)]">
        <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[rgb(40,42,56)] text-white">
        <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
        <p className="text-gray-400">Please create a shop first.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[rgb(40,42,56)] text-white pb-10">
      {/* Cover Image Section */}
      <div className="relative h-[250px] md:h-[320px] overflow-hidden">
        {shop.coverBanner ? (
          <Image
            src={shop.coverBanner}
            alt="Shop Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
        )}
        {/* Cover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(40,42,56)] via-transparent to-black/20" />

        {/* Edit Cover Button */}
        <label className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-white/10">
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isUploadingCover ? 'Uploading...' : 'Change Cover'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={isUploadingCover}
          />
        </label>
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[rgb(40,42,56)] bg-gray-800 shadow-2xl relative overflow-hidden">
              {shop.avatar?.[0]?.url ? (
                <Image
                  src={shop.avatar[0].url}
                  alt={shop.name}
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full">
                  <span className="text-4xl font-bold text-white">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Edit Avatar Button */}
            <label className="absolute bottom-0 right-0 w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg border-2 border-[rgb(40,42,56)]">
              {isUploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          {/* Shop Info */}
          <div className="flex-1 pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {shop.name}
              </h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl transition-all text-sm font-medium border border-white/10"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
            <p className="text-gray-300 mb-3 max-w-2xl text-sm leading-relaxed line-clamp-2">
              {shop.description}
            </p>

            {/* Location & Hours */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {shop.address}
              </span>
              {shop.openingHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {shop.openingHours}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{shop.ratings.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">
                  ({shop._count.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">{shop.followersCount}</span>
                <span className="text-gray-500 text-sm">followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-green-400" />
                <span className="font-semibold">{shop._count.products}</span>
                <span className="text-gray-500 text-sm">products</span>
              </div>
            </div>
          </div>

          {/* Shop Details - Compact (Right side on lg) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
              <h4 className="text-sm font-semibold text-white mb-3">
                Shop Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="text-white">
                    {formatCategory(shop.category)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-white">
                    {formatDate(shop.createdAt)}
                  </span>
                </div>
                {shop.website && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Website</span>
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 truncate max-w-[120px]"
                    >
                      {shop.website.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-1.5">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 bg-gray-700/50 hover:bg-gray-600 rounded-md flex items-center justify-center transition-all text-gray-400 hover:text-white"
                      >
                        {socialIcons[link.platform] || (
                          <Globe className="w-3 h-3" />
                        )}
                      </a>
                    ))}
                    <button
                      onClick={() => setEditingSocialLinks(true)}
                      className="text-xs text-gray-500 hover:text-blue-400 ml-auto"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
              {socialLinks.length === 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <button
                    onClick={() => setEditingSocialLinks(true)}
                    className="text-xs text-gray-500 hover:text-blue-400"
                  >
                    + Add social links
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Shop Details */}
        <div className="lg:hidden mt-5 bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">
            Shop Details
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div className="flex gap-2">
              <span className="text-gray-500">Category:</span>
              <span className="text-white">
                {formatCategory(shop.category)}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Joined:</span>
              <span className="text-white">{formatDate(shop.createdAt)}</span>
            </div>
            {shop.website && (
              <div className="flex gap-2">
                <span className="text-gray-500">Website:</span>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {shop.website.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </div>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-1.5">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-gray-700/50 hover:bg-gray-600 rounded-md flex items-center justify-center transition-all text-gray-400 hover:text-white"
                >
                  {socialIcons[link.platform] || <Globe className="w-3 h-3" />}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social Links Edit Modal */}
      {editingSocialLinks && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                Edit Social Links
              </h3>
              <button
                onClick={() => setEditingSocialLinks(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, 'platform', e.target.value)
                    }
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateSocialLink(index, 'url', e.target.value)
                    }
                    placeholder="URL"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={() => removeSocialLink(index)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={addSocialLink}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Add Link
                </button>
                <button
                  onClick={() => {
                    handleSaveSocialLinks();
                    setEditingSocialLinks(false);
                  }}
                  disabled={updateShopMutation.isPending}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {updateShopMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Tab Navigation */}
        <div className="flex bg-gray-800/30 p-1.5 rounded-xl mb-6">
          {(['products', 'offers', 'reviews'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 font-semibold capitalize transition-all rounded-lg ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">Products</h3>
                <Link
                  href="/dashboard/all-products"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.slice(0, 8).map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium mb-2">No products yet</p>
                  <Link
                    href="/dashboard/create-product"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Create your first product →
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold">Active Offers</h3>
                <Link
                  href="/dashboard/all-events"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              {events.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {events.slice(0, 8).map((event: any) => (
                    <ProductCard
                      key={event.id}
                      product={event}
                      isEvent
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium mb-2">No active offers</p>
                  <Link
                    href="/dashboard/create-event"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Create an event →
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-xl font-bold mb-5">Recent Reviews</h3>
              {shop.reviews && shop.reviews.length > 0 ? (
                <div className="space-y-4">
                  {shop.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="bg-gray-800/50 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex-shrink-0">
                          {review.user?.avatar?.[0]?.url ? (
                            <Image
                              src={review.user.avatar[0].url}
                              alt={review.user.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {review.user?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">
                              {review.user?.name}
                            </h4>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {review.reviews}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Edit Shop Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Shop Name
                </label>
                <input
                  {...register('name', { required: 'Shop name is required' })}
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Description
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  rows={3}
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Category
                </label>
                <input
                  {...register('category', {
                    required: 'Category is required',
                  })}
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors"
                />
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Address
                </label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Working Hours
                </label>
                <input
                  {...register('openingHours')}
                  placeholder="e.g., Mon-Fri 9AM-6PM"
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-2 text-sm">
                  Website
                </label>
                <input
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                  className="w-full border outline-none border-gray-700 bg-gray-800/50 p-3.5 rounded-xl text-white focus:border-blue-500 transition-colors placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateShopMutation.isPending}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {updateShopMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopProfilePage;
