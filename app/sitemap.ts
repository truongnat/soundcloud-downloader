import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://universal-music-downloader.vercel.app'
    const languages = ['en', 'vi', 'zh', 'ko', 'ja']

    const routes = languages.map((lang) => ({
        url: `${baseUrl}/${lang}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: lang === 'vi' ? 1 : 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...routes,
    ]
}
