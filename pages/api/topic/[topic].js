async function getRepositoriesByTopic(topic, currentPage = 1, totalItems = []) {
    const url = `https://api.github.com/search/repositories?q=${topic}&per_page=100&page=${currentPage}&sort=committer-date&order=desc`;
    
    const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://github-feed-generator-theta.vercel.app';
    const fetchURL = `${BASE_URL}/api/github?url=${url.replace(/\&/gi, '_____')}&v=3`;
    console.error('fetchURL', fetchURL);
    const response = await fetch(fetchURL);
    const { data, headers } = await response.json();
    const paginationItems = headers.link?.split(',');
    const nextPageItem = paginationItems?.find((link) => link.includes('rel="next"'));
    const hasNextURL = Boolean(nextPageItem);
    const requestItems = data.items || [];
    const allCurrentItems = [ ...totalItems, ...requestItems ];
    
    if(hasNextURL) {
        const nextPage = currentPage + 1;
        return await getRepositoriesByTopic(topic, nextPage, allCurrentItems)
    }

    console.error('[allCurrentItems]', allCurrentItems.length);


    return allCurrentItems.map((item, index) => {
        return {
            index,
            title: item.full_name,
            url: item.homepage || item.html_url,
        }
    });
}


function xmlFeedView({ title, items }) {
    function entry(item) {
        return (
`<item>

<pubDate>Tue, 13 Apr 2020 11:11:11 GMT</pubDate>
<index>${item.index}</index>
<title>${item.title}</title>
<author>item.author</author>

<description>item.description</description>

<link><![CDATA[${item.url}]]></link>

</item>
`
        )
    }

    return (
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">

<channel>
    
<title>GitHub Topic: ${title}
</title>
    
<author>GitHub Topic: ${title}
</author>
    ${items.map(entry).join('')}

</channel>

</rss>`
    )
}


export default async function handler(req,res) {
    const { topic } = req.query;
    
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader(
        'Cache-Control',
        's-maxage=86400, immutable'
    );
    try {
        const items = await getRepositoriesByTopic(topic);
        res.end(xmlFeedView({ items, title: `Repositories by Topic: "${topic}"` }));
    } catch(err) {
        res.end({
            error: err.message,
            errorText: JSON.stringify(err)
        })
    }

}
