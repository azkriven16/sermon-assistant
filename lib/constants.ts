export const siteConfig = {
    name: "Sermon Assistant",
    description:
        "Sermon Assistant is a tool that helps you find and listen to sermons from the Holy Spirit.",
    url: "https://sermon-assistant.vercel.app/",
    ogImage: "https://sermon-assistant.vercel.app/opengraph-image.png",
    keywords: ["sermon", "preaching", "AI", "assistant", "theology"],
};

export const siteMetadata = {
    title: "Sermon Assistant",
    description: "Your AI-powered sermon preparation tool.",
    keywords: siteConfig.keywords,
    openGraph: {
        title: "Sermon Assistant",
        description: "Your AI-powered sermon preparation tool.",
        url: siteConfig.url,
        siteName: "Sermon Assistant",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};
