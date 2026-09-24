'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';
import PALETTE from '../../constants/palette';
import { useStoreData } from '../../providers/StoreProvider';
import useAuthStore from '../../store/authStore';

export const CategoryDrawer = ({ isOpen, onClose }) => {
  const { categories } = useStoreData();
  const { user, isAuthenticated } = useAuthStore();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [expandedMobileIds, setExpandedMobileIds] = useState(new Set());

  if (!isOpen) return null;

  const toggleMobileExpand = (catId, e) => {
    if (e) e.stopPropagation();
    setExpandedMobileIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const topCategories = (categories || []).filter(
    (c) =>
      (!c.parentId || (typeof c.parentId === 'object' && !c.parentId?._id)) &&
      c.showOnMenu !== false &&
      c.isActive !== false
  );

  const currentActive =
    topCategories.find((c) => c._id === activeCategoryId) ||
    (topCategories.length > 0 ? topCategories[0] : null);

  const subGroups = currentActive?.children || [];

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      <div className="relative flex h-full max-h-screen z-10">
        <div className="w-72 sm:w-80 bg-white h-full shadow-2xl flex flex-col overflow-y-auto border-r border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            {isAuthenticated() ? (
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 hover:opacity-80 transition"
              >
                <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700">
                  <Icon name="user" size={18} color="#334155" />
                </div>
                <div className="text-xs leading-tight">
                  <span className="block text-slate-400 text-[11px]">Xin chào,</span>
                  <strong className="block text-slate-800 font-semibold truncate max-w-[150px]">
                    {user?.fullName || user?.name || user?.email?.split('@')[0]}
                  </strong>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-2.5 hover:opacity-80 transition"
              >
                <div className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700">
                  <Icon name="user" size={18} color="#334155" />
                </div>
                <div className="text-xs leading-tight">
                  <span className="block text-slate-400 text-[11px]">Tài khoản</span>
                  <strong className="block text-slate-800 font-semibold">
                    Đăng nhập
                  </strong>
                </div>
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Đóng danh mục"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <div className="flex-1 py-1 overflow-y-auto">
            {topCategories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isSelected = currentActive?._id === cat._id;
              const isMobileExpanded = expandedMobileIds.has(cat._id);
              const iconUrl = cat.icon?.url;

              return (
                <div key={cat._id} className="border-b border-slate-50 last:border-b-0">
                  <div
                    onMouseEnter={() => setActiveCategoryId(cat._id)}
                    onClick={() => {
                      setActiveCategoryId(cat._id);
                      if (hasChildren) toggleMobileExpand(cat._id);
                    }}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-100 text-[#284ea1] font-semibold'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={cat.name}
                          className="w-5 h-5 object-contain shrink-0"
                        />
                      ) : (
                        <Icon
                          name="tag"
                          size={17}
                          color={isSelected ? PALETTE.primary : '#475569'}
                        />
                      )}
                      <span className="truncate">{cat.name}</span>
                    </div>

                    {hasChildren && (
                      <div className="flex items-center gap-1">
                        <span className="md:hidden text-slate-400 p-1">
                          <Icon
                            name={isMobileExpanded ? 'chevron-down' : 'chevron-right'}
                            size={12}
                          />
                        </span>
                        <span className="hidden md:inline">
                          <Icon
                            name="chevron-right"
                            size={13}
                            color={isSelected ? PALETTE.primary : '#94a3b8'}
                          />
                        </span>
                      </div>
                    )}
                  </div>

                  {hasChildren && isMobileExpanded && (
                    <div className="md:hidden pl-10 pr-4 py-2 bg-slate-50/80 border-t border-slate-100 space-y-2">
                      {cat.children.map((subGroup) => (
                        <div key={subGroup._id} className="space-y-1">
                          <Link
                            href={`/collections/${subGroup.slug || subGroup._id}`}
                            onClick={onClose}
                            className="text-xs font-bold text-slate-800 hover:text-[#284ea1] block py-1"
                          >
                            {subGroup.name}
                          </Link>
                          {subGroup.children && subGroup.children.length > 0 && (
                            <div className="pl-2 space-y-1 border-l border-slate-200">
                              {subGroup.children.map((subItem) => (
                                <Link
                                  key={subItem._id}
                                  href={`/collections/${subItem.slug || subItem._id}`}
                                  onClick={onClose}
                                  className="text-[11px] text-slate-600 hover:text-[#284ea1] block py-0.5"
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {subGroups.length > 0 && (
          <div className="hidden md:block bg-white h-full shadow-2xl border-l border-slate-100 p-6 overflow-y-auto w-[480px] lg:w-[680px] xl:w-[840px] max-w-[calc(100vw-340px)] animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {subGroups.map((group) => (
                <div key={group._id} className="space-y-3">
                  <Link
                    href={`/collections/${group.slug || group._id}`}
                    onClick={onClose}
                    className="text-xs font-extrabold text-slate-900 uppercase tracking-wider hover:text-[#284ea1] transition block"
                  >
                    {group.name}
                  </Link>

                  {group.children && group.children.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {group.children.map((subItem) => (
                        <li key={subItem._id}>
                          <Link
                            href={`/collections/${subItem.slug || subItem._id}`}
                            onClick={onClose}
                            className="hover:text-[#284ea1] hover:underline transition block py-0.5"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Link
                      href={`/collections/${group.slug || group._id}`}
                      onClick={onClose}
                      className="text-xs text-slate-500 hover:text-[#284ea1] hover:underline"
                    >
                      Xem tất cả
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDrawer;
