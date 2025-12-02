import 'server-only'

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    vi: () => import('@/dictionaries/vi.json').then((module) => module.default),
    zh: () => import('@/dictionaries/zh.json').then((module) => module.default),
    ko: () => import('@/dictionaries/ko.json').then((module) => module.default),
    ja: () => import('@/dictionaries/ja.json').then((module) => module.default),
}

import { cache } from 'react'

export const getDictionary = cache(async (locale: 'en' | 'vi' | 'zh' | 'ko' | 'ja') => dictionaries[locale]())
