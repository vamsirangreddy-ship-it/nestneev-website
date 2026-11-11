#!/usr/bin/env python3
"""Export content/blog/*.json as a WordPress import file (WXR 1.2).
Run:  python3 scripts/export-blog-wxr.py   -> wordpress-migration/nestneev-blog-export.xml
Keeps the same slugs (so /blog/<slug>/ URLs stay identical) and the cover images (featured image).
"""
import json, glob, os, datetime, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://nestneev.com"
posts = sorted((json.load(open(f)) for f in glob.glob(os.path.join(ROOT, "content/blog/*.json"))), key=lambda p: p["date"])

def cdata(s): return "<![CDATA[" + str(s).replace("]]>", "]]]]><![CDATA[>") + "]]>"
def body_html(text):
    paras = [p.strip() for p in str(text).replace("\r", "").split("\n\n") if p.strip()]
    return "\n\n".join("<p>" + html.escape(p).replace("\n", "<br>") + "</p>" for p in paras)

out = ['<?xml version="1.0" encoding="UTF-8" ?>',
'<rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/">',
'<channel>',
'<title>NestNeev</title>', f'<link>{SITE}/blog</link>', '<description>Gurugram real estate</description>',
'<language>en-IN</language>', '<wp:wxr_version>1.2</wp:wxr_version>',
f'<wp:base_site_url>{SITE}</wp:base_site_url>', f'<wp:base_blog_url>{SITE}/blog</wp:base_blog_url>',
'<wp:author><wp:author_id>1</wp:author_id><wp:author_login>' + cdata("nestneev") + '</wp:author_login><wp:author_email>' + cdata("neevnest@gmail.com") + '</wp:author_email><wp:author_display_name>' + cdata("NestNeev") + '</wp:author_display_name></wp:author>',
'<wp:category><wp:term_id>2</wp:term_id><wp:category_nicename>' + cdata("blog") + '</wp:category_nicename><wp:category_parent></wp:category_parent><wp:cat_name>' + cdata("Blog") + '</wp:cat_name></wp:category>']

pid = 100
for p in posts:
    pid += 1; aid = pid; pid += 1; post_id = pid
    d = p["date"] + " 09:00:00"
    img = p.get("coverImage") or ""
    if img:
        url = img if img.startswith("http") else SITE + img
        out.append(f'''<item><title>{cdata(p["title"] + " (cover)")}</title><link>{url}</link><pubDate>{datetime.datetime.strptime(d, "%Y-%m-%d %H:%M:%S").strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate><dc:creator>{cdata("nestneev")}</dc:creator><guid isPermaLink="false">{url}</guid><description></description><content:encoded>{cdata("")}</content:encoded><excerpt:encoded>{cdata("")}</excerpt:encoded><wp:post_id>{aid}</wp:post_id><wp:post_date>{cdata(d)}</wp:post_date><wp:post_date_gmt>{cdata(d)}</wp:post_date_gmt><wp:post_name>{cdata(os.path.splitext(os.path.basename(img))[0])}</wp:post_name><wp:status>{cdata("inherit")}</wp:status><wp:post_parent>{post_id}</wp:post_parent><wp:post_type>{cdata("attachment")}</wp:post_type><wp:attachment_url>{cdata(url)}</wp:attachment_url></item>''')
    thumb = f'<wp:postmeta><wp:meta_key>{cdata("_thumbnail_id")}</wp:meta_key><wp:meta_value>{cdata(aid)}</wp:meta_value></wp:postmeta>' if img else ""
    out.append(f'''<item><title>{cdata(p["title"])}</title><link>{SITE}/blog/{p["slug"]}/</link><pubDate>{datetime.datetime.strptime(d, "%Y-%m-%d %H:%M:%S").strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate><dc:creator>{cdata("nestneev")}</dc:creator><guid isPermaLink="false">{SITE}/blog/{p["slug"]}/</guid><description></description><content:encoded>{cdata(body_html(p["body"]))}</content:encoded><excerpt:encoded>{cdata(p.get("excerpt", ""))}</excerpt:encoded><wp:post_id>{post_id}</wp:post_id><wp:post_date>{cdata(d)}</wp:post_date><wp:post_date_gmt>{cdata(d)}</wp:post_date_gmt><wp:post_name>{cdata(p["slug"])}</wp:post_name><wp:status>{cdata("publish")}</wp:status><wp:post_parent>0</wp:post_parent><wp:post_type>{cdata("post")}</wp:post_type><category domain="category" nicename="blog">{cdata("Blog")}</category>{thumb}</item>''')
out += ["</channel>", "</rss>"]
dest = os.path.join(ROOT, "wordpress-migration", "nestneev-blog-export.xml")
open(dest, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("wrote", dest, len(posts), "posts")
