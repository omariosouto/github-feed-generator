export default async function handler(req, res) {
    const receivedUrl = req.query.url.replace(/\_\_\_\_\_/gi, '&');
    const response = await fetch(receivedUrl, {
        headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
        }
    });
    // console.log('/api/github [receivedUrl]', receivedUrl);

    res.setHeader(
        'Cache-Control',
        's-maxage=86400, immutable'
    );

    const headers = [...response.headers.entries()].reduce((acc,[key, value]) => ({
        ...acc,
        [key]: value
    }), {});


    res.json({
        headers,
        data: await response.json(),
    });
}
