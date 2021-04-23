export default async function handler(req, res) {
    const response = await fetch(req.query.url, {
        headers: {
            authorization: `token ${process.env.GITHUB_TOKEN}`,
        }
    });

    res.setHeader(
        'Cache-Control',
        's-maxage=31536000, immutable'
    );

    res.json(await response.json());
}