export async function scrapeImages(query: string, count = 8): Promise<string[]> {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const html = await res.text();

  // Bing embeds full-res URLs as murl:"<url>" in the HTML
  const urls: string[] = [];
  const matches = html.matchAll(/murl&quot;:&quot;([^&]+)/g);

  for (const match of matches) {
    if (urls.length >= count) break;
    const imgUrl = match[1];
    if (imgUrl && imgUrl.startsWith("http")) {
      urls.push(imgUrl);
    }
  }

  return urls;
}
